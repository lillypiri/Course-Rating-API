const auth = require('basic-auth');
const User = require('../models').User;

function requiresLogin(req, res, next) {
  // get credentials out of auth header
  const credentials = auth(req);
  if (!credentials) {
    const err = new Error('Credentials required.')
    err.status = 401;
    return next(err);
  }
  console.log(credentials);
  User.authenticate(credentials.name, credentials.pass, function(error, user) {
    if (error || !user) {
      const err = new Error('Wrong email or password');
      err.status = 401;
      return next(err);
    } else {
      req.currentUser = user; //decorate request with signed in user
      return next();
    }
  })
}

module.exports.requiresLogin = requiresLogin;