const dotenv = require("dotenv");
var jwt = require('jsonwebtoken');
var { ERRORS } = require('./constants');
dotenv.config();

function encrypt(data, options) {
    return new Promise((resolve, reject) => {
        jwt.sign(data, process.env.PRIVATE_KEY, options, function (err, token) {
            if (err) {
                console.log(err)
                reject(ERRORS.SOMETHING_WRONG)
            }
            resolve(token)
        });
    })
}


function decrypt(data) {
    return new Promise((resolve, reject) => {
        jwt.verify(data, process.env.PRIVATE_KEY, function (error, decoded) {
            if (error) {
                reject(error)
            } else {
                delete decoded.iat;
                delete decoded.exp;
                resolve(decoded)
            }
        });
    })
}

module.exports = {
    encrypt,
    decrypt
}