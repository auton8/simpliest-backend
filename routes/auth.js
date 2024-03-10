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



      if (!req.body.token && !req.body.micro) {
        var passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.send(ERRORS.INVALID_EMAIL_PASSWORD);
      }

      if (!Boolean(user.email_verified)) {
        return res.json({ status: true, code: 406, email: user.email, message: 'Please verify your email address, check your email address for activation link' })
      }


      var token = await encrypt(user, { expiresIn: 80000 });
      delete user.password;
      delete user.type;
      delete user.referred;
      res.json({
        status: true,
        message: 'Successfully Logged In',
        data: {
          ...user,
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