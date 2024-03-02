var express = require('express');
var router = express.Router();

const userRouter = require('./user');
const authRouter = require('./auth');

router.use('/user', userRouter);
router.use('/auth', authRouter);

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Auton8' });
  });

  
module.exports = router;
