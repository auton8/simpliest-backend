var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator')
const { encrypt, decrypt } = require('../utils/encryptor'); // decrypt for feature/task_googleauth
const { ERRORS, PLAN_LIMITS, INVITE_STATUS, NODE_MAILER_CONFIG } = require('../utils/constants');
const bcrypt = require('bcryptjs');
const User = require("../schema/User");
const passwordValidator = require('password-validator');

var schema = new passwordValidator();
schema
  .is().min(8)                                    // Minimum length 8
  .is().max(100)                                  // Maximum length 100
  .has().uppercase()                              // Must have uppercase letters
  .has().lowercase()                              // Must have lowercase letters
  .has().digits(1)                                // Must have at least 2 digits
  .has().symbols(1)
  .has().letters()
  .has().not().spaces()                           // Should not have spaces
  .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


  const checkIfStrongPassword = (password) => {
    return new Promise((resolve, reject) => {
      if (schema.validate(password))
        resolve(true);
      else
        reject(new Error('Password Is Not Strong'))
    })
  }


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

  router.post('/signup', async (req, res, next) => {
    try {
      const { username, full_name, password, email } = req.body;
      console.log(req.body,"req.body")

      // Check if any required field is missing
      if (!username || !full_name || !password || !email) {
        return res.status(400).json({ status: false, message: 'Missing required fields' });
      }
  console.log(req.body,"req.body1")
      // Hash the password
      const saltRounds = 10;
      const hashPassword = await bcrypt.hash(password, saltRounds);
  
      // Create new user
      const newUser = await User.create({
        username,
        full_name,
        password: hashPassword,
        email,
      });
  
      // Fetch created user
      // const user = await User.findOne({ email, status: true }).populate({ path: 'organization', select: '_id name' }).lean().exec();
  
      return res.status(200).json({
        status: true,
        message: 'Registered Successfully',
        data: newUser
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json(ERRORS.SOMETHING_WRONG);
    }
  });
  

  module.exports = router;