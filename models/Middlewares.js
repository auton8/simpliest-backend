const { decrypt } = require('../utils/encryptor');
const { ERRORS } = require('../utils/constants');
const User = require('../schema/User');


const AuthMiddlewareWeb = () => [
    async function (req, res, next) {
        try {
            var authHeader = req.headers.authorization
            if (!authHeader)
                return res.json(ERRORS.UNAUTHORIZE);

            const token = authHeader.split(' ')[1];
            if (!token)
                return res.json(ERRORS.UNAUTHORIZE);

            var user = await decrypt(token);
            if (!user)
                return res.json(ERRORS.UNAUTHORIZE);

            user = await User.findOne({ _id: user._id, status: true });
            if (!user) {
                console.log('here')
                return res.json(ERRORS.UNAUTHORIZE);
            }
            req.user = user;
            return next();
        } catch (error) {
            console.log(error,"err")
            return res.json(ERRORS.UNAUTHORIZE);
        }
    }
]

module.exports = {
    AuthMiddlewareWeb,
}