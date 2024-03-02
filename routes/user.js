const express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator')
const { AuthMiddlewareWeb } = require('../models/Middlewares');
const { ERRORS } = require('../utils/constants');
const { default: mongoose } = require('mongoose');


router.post('/',
  AuthMiddlewareWeb(),
  async (req, res, next) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.json({ status: false, message: "Missing Params" });

      let { search, pageSize, page, invite_status } = req.body
      let skip = 0
      if (page > 1) {
        skip = pageSize * page;
      }

      let filter = {
        status: true,
        $or: [
          { 'invitee': new mongoose.Types.ObjectId(req.user._id) },
          { 'referred': new mongoose.Types.ObjectId(req.user._id) },
          { 'identifier': req.user.email },
        ],
        // $or: [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }]
      }
      if (invite_status == 1) {
        filter.invite_status = 1;
      } else if (invite_status == 2) {
        filter.invite_status = 2;
      } else if (invite_status == 3) {
        filter.invite_status = 3;
      }
      else if (invite_status == 4) {
        filter.invite_status = 4;
      }

      var members = await Invite.aggregate([
        {
          $match: filter
        },
        { $skip: skip },
        { $limit: Number(pageSize) },
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
        { $addFields: { organization: { $first: "$organization.name" } } },
        {
          $lookup: {
            from: "users",
            localField: "referred",
            foreignField: "_id",
            pipeline: [{
              $match: {
                status: true
              }
            }],
            as: "user"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "invitee",
            foreignField: "_id",
            pipeline: [{
              $match: {
                status: true
              }
            }],
            as: "invitee"
          }
        },
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
        { $addFields: { user: { $first: "$user.full_name" } } },
        { $addFields: { invitee: { $first: "$invitee.full_name" } } },
        { $addFields: { role: { $first: "$role" } } },
        {
          $project: {
            "email": "$identifier",
            invited_by: "$user",
            invitee: "$invitee",
            "invite_date": "$created_at",
            organization: 1,
            invite_status: 1,
            role_id: "$role._id",
            role: "$role.name",
            "self": {
              $cond: { if: { $eq: ["$identifier", req.user.email] }, then: 1, else: 0 }
            }
          }
        },
        { $sort: { created_at: -1 } },
      ]);

      for (var i = 0; i < members.length; ++i)
        members[i].index = (i + 1);

      return res.json({
        status: true,
        message: 'Data Found',
        data: members
      });
    } catch (error) {
      console.log(error)
      return res.json(ERRORS.SOMETHING_WRONG)
    }
  });

  module.exports = router;
