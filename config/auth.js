const jwt = require("jsonwebtoken");
const keys = require("./keys");

function returnNotSuppliedError() {
    return {
        success: false,
        message: 'Auth token is not supplied'
      };
}

function returnNotValidError() {
    return {
        success: false,
        message: 'Auth token is not valid'
      };
}

function returnUnknownError() {
    return {
        success: false,
        message: 'Unknown error while validating token'
      };
}

function validate(token) {
    try {
        // // get token from request
        // var token = req.headers['token'];
        if (!token) returnNotSuppliedError();
        if (token.startsWith('Bearer ')) token = token.slice(7, token.length);
        if (!token) returnNotSuppliedError();
        jwt.verify(token, keys.secretOrKey, (err, decoded) => {
        if (err) returnNotValidError();
        console.log(decoded.id);
        return decoded.id;
        });
    } catch (err) {
        console.log(err);
        returnUnknownError();
    }
}