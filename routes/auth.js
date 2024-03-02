var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator')
const { encrypt, decrypt } = require('../utils/encryptor'); // decrypt for feature/task_googleauth
const { ERRORS, PLAN_LIMITS, INVITE_STATUS, NODE_MAILER_CONFIG } = require('../utils/constants');
const bcrypt = require('bcryptjs');
const User = require("../schema/User");


const createUser = async (req) => {
    try {
      let {
        username,
        full_name,
        password,
        email,
      } = req;
  
      let ifUserExist = await User.findOne({
        "$or": [{
          "email": email
        }, {
          "username": username
        }]
      });
      if (ifUserExist) return;
      try {
        const saltRounds = 10;
        var salt = await bcrypt.genSalt(saltRounds);
        var hashPassword = await bcrypt.hash(password, salt);
        let data = {
          username,
          full_name,
          password: hashPassword,
          email,
          login_type: "microsoft"
        };
        await User.create(data);
      } catch (error) {
        console.log(error)
      }
    } catch (error) {
      console.log(error)
    }
  }

  router.post('/login',
  body('email').exists().notEmpty() || body('micro').exists().notEmpty() || body('token').exists().notEmpty(),     // #3: feature/task_googleauth token condition
  body('password').exists().notEmpty() || body('micro').exists().notEmpty() || body('token').exists().notEmpty(),  // #4: feature/task_googleauth token condition
  async (req, res, next) => {
    try {
      // #5: feature/task_googleauth token check
      var email, password;
      if (req.body.token) {
        let user = await decrypt(req.body.token);
        email = (user.login) ? user.login + "@github.com" : user.email;

      }
      else if (req.body.micro) {
        //x feature/task_microauth
        email = req.body.micro.userPrincipalName;
        await createUser({
          username: req.body.micro.userPrincipalName,
          full_name: req.body.micro.displayName,
          password: req.body.micro.id,
          email: req.body.micro.userPrincipalName
        });
        //x
      }
      // #5: ================
      else {
        email = req.body.email;
        password = req.body.password;
        const errors = validationResult(req);
        if (!errors.isEmpty())
          return res.json({ status: false, message: "Missing Params" });
      }

      var user = await User.findOne({ email, status: true }).select('+password').lean().exec();
      if (!user) return res.send(ERRORS.INVALID_EMAIL_PASSWORD);

      let organizations = await Organization.aggregate([
        {
          $match: {
            user_id: user._id,
            status: true
          }
        },

        {
          $lookup: {
            from: "groups",
            localField: "_id",
            foreignField: "org_id",
            pipeline: [{
              $match: {
                parent: null
              }
            }],
            as: "group"
          }
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "subscription",
            foreignField: "_id",
            as: "subscription",
            pipeline: [
              {
                $lookup: {
                  from: "subscription_plans",
                  localField: "plan",
                  foreignField: "_id",
                  as: "plan"
                }
              },
            ]
          }
        },
        { $addFields: { root: { $first: "$group._id" } } },
        { $addFields: { type: 1 } },
        {
          $project: {
            name: 1,
            root: 1,
            type: 1,
            subscription: {
              name: 1,
              last_renewal: 1,
              expiry_date: 1,
              is_expired: 1,
              is_free: 1,
              plan: 1
            }
          }
        },
        {
          "$unwind": {
            path: "$subscription",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$unwind": {
            path: "$subscription.plan",
            preserveNullAndEmptyArrays: true
          }
        },
      ]);

      let shared_organizations = await SharedOrganization.aggregate([
        {
          $match: {
            user_id: user._id,
            status: true,
          }
        },
        {
          $lookup: {
            from: "groups",
            localField: "org_id",
            foreignField: "org_id",
            pipeline: [{
              $match: {
                parent: null
              }
            }],
            as: "group"
          }
        },
        { $addFields: { root: { $first: "$group._id" } } },
        {
          $lookup: {
            from: "organizations",
            localField: "org_id",
            foreignField: "_id",
            pipeline: [{
              $match: {
                status: true
              }
            }],
            as: "organization"
          }
        },
        { $addFields: { organization: { $first: "$organization" } } },
        // { $addFields: { org_id: { $first: "$organization._id" } } },
        {
          $lookup: {
            from: "subscriptions",
            localField: "organization.subscription",
            foreignField: "_id",
            as: "subscription",
            pipeline: [
              {
                $lookup: {
                  from: "subscription_plans",
                  localField: "plan",
                  foreignField: "_id",
                  as: "plan"
                }
              },
            ]
          }
        },
        {
          $lookup: {
            from: "roles",
            localField: "role_id",
            foreignField: "_id",
            pipeline: [{ $match: { status: true } }],
            as: "role"
          }
        },
        { $addFields: { role: { $first: "$role" } } },
        { $addFields: { type: 2 } },
        {
          $addFields: {
            "permissions": {
              list_group: "$role.list_group",
              create_group: "$role.create_group",
              edit_group: "$role.edit_group",
              delete_group: "$role.delete_group",
              list_schedule: "$role.list_schedule",
              create_schedule: "$role.create_schedule",
              edit_schedule: "$role.edit_schedule",
              delete_schedule: "$role.delete_schedule",
              list_test: "$role.list_test",
              create_test: "$role.create_test",
              edit_test: "$role.edit_test",
              delete_test: "$role.delete_test",
              run_test: "$role.run_test",
              list_test_history: "$role.list_test_history",
              add_test_group: "$role.add_test_group",
              change_test_group: "$role.change_test_group",
              test_run_detail: "$role.test_run_detail",
              list_rule: "$role.list_rule",
              create_rule: "$role.create_rule",
              edit_rule: "$role.edit_rule",
              delete_rule: "$role.delete_rule",
              list_migration: "$role.list_migration",
              create_migration: "$role.create_migration",
              edit_migration: "$role.edit_migration",
              delete_migration: "$role.delete_migration",
              execution_migration: "$role.execute_migration",
              parse_migration: "$role.parse_migration",
              switch_migration: "$role.switch_migration"

            }
          }
        },
        {
          $project: {
            _id: "$organization._id",
            name: "$organization.name",
            root: 1,
            type: 2,
            permissions: 1,
            subscription: 1
          }
        },
        {
          "$unwind": {
            path: "$subscription",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          "$unwind": {
            path: "$subscription.plan",
            preserveNullAndEmptyArrays: true
          }
        },
      ]);

      if (!req.body.token && !req.body.micro) {
        var passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.send(ERRORS.INVALID_EMAIL_PASSWORD);
      }

      if (!Boolean(user.email_verified)) {
        return res.json({ status: true, code: 406, email: user.email, message: 'Please verify your email address, check your email address for activation link' })
      }

      organizations = [...organizations, ...shared_organizations];
      await Promise.all(organizations.map(async org => {
        let org_id = org._id;
        if (org.subscription && org.subscription.plan) {
          if (!Boolean(org.subscription.is_expired)) {
            if (moment().isAfter(moment(org.subscription.createdAt).add(org.subscription.plan.expire_in_days, 'days'))) {
              await Subscription.updateOne({ organzation: mongoose.Types.ObjectId(org_id) }, { is_expired: true }, { upsert: false })
              org.subscription.is_expired = true;
            }
          }

          // console.log(org.subscription.plan)
          let keys = Object.keys(org.subscription.plan);
          await Promise.all(keys.map(async key => {
            let limitCount = Number(org.subscription.plan[key]);
            switch (key) {
              case PLAN_LIMITS.api_suites_limit: {
                let dataCount = await Api.count({ org_id })
                if (dataCount >= limitCount) {
                  org.subscription.plan.api_suites_limit_expired = true;
                } else {
                  org.subscription.plan.api_suites_limit_expired = false;
                }
                // return res.json(ERRORS.PLAN_LIMIT_EXCEEDED)
                break;
              }

              case PLAN_LIMITS.test_cases_limit: {
                let dataCount = await Test.count({ org_id })
                if (dataCount >= limitCount) {
                  org.subscription.plan.test_cases_limit_expired = true;
                } else {
                  org.subscription.plan.test_cases_limit_expired = false;
                }
                break;
              }
              case PLAN_LIMITS.scenarios_limit: {
                let dataCount = await Group.count({ org_id })
                if (dataCount >= limitCount) {
                  org.subscription.plan.scenarios_limit_expired = true;
                } else {
                  org.subscription.plan.scenarios_limit_expired = false;
                }
                break;
              }

              case PLAN_LIMITS.schedules_limit: {
                let dataCount = await Schedule.count({ org_id })
                if (dataCount >= limitCount) {
                  org.subscription.plan.schedules_limit_expired = true;
                } else {
                  org.subscription.plan.schedules_limit_expired = false;
                }
                break;
              }

              case PLAN_LIMITS.members_limit: {
                let dataCount = await Invite.count({ org_id })
                if (dataCount >= limitCount) {
                  org.subscription.plan.members_limit_expired = true;
                } else {
                  org.subscription.plan.members_limit_expired = false;
                }
                break;
              }
              default:
                break;
            }
          }))
        }
      }))

      var token = await encrypt(user, { expiresIn: 80000 });
      delete user.password;
      delete user.organization;
      delete user.shared_organization;
      delete user.type;
      delete user.referred;
      res.json({
        status: true,
        message: 'Successfully Logged In',
        data: {
          ...user,
          organizations,
          accessToken: token
        }
      });
    } catch (error) {
      console.log(error)
      return res.json(ERRORS.SOMETHING_WRONG)
    }
  });

  router.post('/signup',
  body('full_name').exists().notEmpty(),
  body('username').exists().notEmpty(),
  body('email').exists().notEmpty(),
  body('password').exists().notEmpty(),
  body('referral').optional(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.json({ status: false, message: "Missing Params" });

      let {
        username,
        full_name,
        password,
        email,
        referral
      } = req.body;

      let ifUserExist = await User.findOne({
        "$or": [{
          "email": email
        }, {
          "username": username
        }]
      });
      if (ifUserExist) return res.send(ERRORS.DUPLICATE_USER);

      try {
        var isReferral = false;
        var invitedBy = null
        if (referral) {
          inviteData = await Invite.findOne({ referral_code: referral, invite_status: INVITE_STATUS.PENDING, is_expired: false })

          if (!inviteData)
            return res.json({ status: false, message: 'Invalid Or Expired Referral Token' })

          if (Boolean(inviteData.is_used)) {
            return res.json({ status: false, message: 'Refferal Token Already Used' })
          }

          if (moment().isAfter(moment(inviteData.createdAt).add(6, 'days'))) {
            await Invite.findOneAndUpdate({ referral_code: referral }, { is_expired: true }, { upsert: false })
            return res.json({ status: false, message: 'Refferal token expired, please signup without refferal token !' })
          }

          invitedBy = inviteData.referred
          isReferral = true;
        }

        await checkIfStrongPassword(password);
        const saltRounds = 10;
        var salt = await bcrypt.genSalt(saltRounds);
        var hashPassword = await bcrypt.hash(password, salt);
        let data = {
          username,
          full_name,
          password: hashPassword,
          email,
          referred_by: invitedBy
        };
        let newUser = await User.create(data);
        var user = await User.findOne({ email, status: true }).populate({ path: 'organization', select: '_id name' }).lean().exec();

        let otp_code = referralCodes.generate({
          length: 6,
          count: 1,
          charset: referralCodes.charset(referralCodes.Charset.NUMBERS),
        })[0];

        await OTP.create({ user_id: newUser._id, otp_code, email })
        await sendActivationEmail(email, { name: full_name, otp: otp_code }, req.get('origin'))

        if (isReferral) {
          let invite = await Invite.findOneAndUpdate({ referral_code: referral }, { $set: { invite_status: INVITE_STATUS.ACCEPT, invitee: newUser._id } }, { upsert: false });
          let data = {
            org_id: invite.org_id,
            role_id: invite.role_id,
            user_id: newUser._id
          };
          await Invite.findOneAndUpdate({ referral_code: referral }, { is_used: true }, { upsert: false })
          await SharedOrganization.create(data);
          await Organization.findOneAndUpdate({ _id: invite.org_id }, { $set: { user: user._id } }, { upsert: true });

          let shared_organizations = await SharedOrganization.aggregate([
            {
              $match: {
                user_id: user._id,
                status: true,
              }
            },
            {
              $lookup: {
                from: "groups",
                localField: "org_id",
                foreignField: "org_id",
                pipeline: [{
                  $match: {
                    parent: null
                  }
                }],
                as: "group"
              }
            },
            { $addFields: { root: { $first: "$group._id" } } },
            {
              $lookup: {
                from: "organizations",
                localField: "org_id",
                foreignField: "_id",
                pipeline: [{
                  $match: {
                    status: true
                  }
                }],
                as: "organization"
              }
            },
            { $addFields: { organization: { $first: "$organization" } } },
            {
              $lookup: {
                from: "roles",
                localField: "role_id",
                foreignField: "_id",
                pipeline: [{
                  $match: {
                    status: true
                  }
                }],
                as: "role"
              }
            },
            { $addFields: { role: { $first: "$role" } } },
            { $addFields: { type: 2 } },
            {
              $addFields: {
                "permissions": {
                  list_group: "$role.list_group",
                  create_group: "$role.create_group",
                  edit_group: "$role.edit_group",
                  delete_group: "$role.delete_group",
                  list_schedule: "$role.list_schedule",
                  create_schedule: "$role.create_schedule",
                  edit_schedule: "$role.edit_schedule",
                  delete_schedule: "$role.delete_schedule",
                  list_test: "$role.list_test",
                  create_test: "$role.create_test",
                  edit_test: "$role.edit_test",
                  delete_test: "$role.delete_test",
                  run_test: "$role.run_test",
                  list_test_history: "$role.list_test_history",
                  add_test_group: "$role.add_test_group",
                  change_test_group: "$role.change_test_group",
                  test_run_detail: "$role.test_run_detail",
                  list_rule: "$role.list_rule",
                  create_rule: "$role.create_rule",
                  edit_rule: "$role.edit_rule",
                  delete_rule: "$role.delete_rule",
                  list_migration: "$role.list_migration",
                  create_migration: "$role.create_migration",
                  edit_migration: "$role.edit_migration",
                  delete_migration: "$role.delete_migration",
                  execution_migration: "$role.execute_migration",
                  parse_migration: "$role.parse_migration",
                  switch_migration: "$role.switch_migration"
                }
              }
            },
            {
              $project: {
                _id: "$organization._id",
                name: "$organization.name",
                root: 1,
                type: 2,
                permissions: 1
              }
            }
          ]);

          let token = await encrypt(user, { expiresIn: 80000 });
          delete user.password;
          delete user.organization;
          delete user.shared_organization;
          var response = {
            ...user,
            organizations: shared_organizations,
            accessToken: token
          };

        } else {
          let token = await encrypt(user, { expiresIn: 80000 });
          delete user.password;
          var response = {
            ...user,
            accessToken: token
          };
        }

        return res.json({
          status: true,
          message: 'Registered Successfully',
          data: response
        });
      } catch (error) {
        console.log(error)
        return res.json({ status: false, message: error.message })
      }


    } catch (error) {
      console.log(error)
      return res.json(ERRORS.SOMETHING_WRONG)
    }
  });

  module.exports = router;