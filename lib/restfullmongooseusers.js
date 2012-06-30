var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Promise = mongoose.Promise,
    mongooseAuth = require('mongoose-auth'),

    UserSchema = new Schema({}, { strict: true }),
    User;

UserSchema.plugin(mongooseAuth, {

  everymodule: {
    everyauth: {

      User: function () {
        return User;
      },

      handleLogout: function (req, res) {
        req.logout();
        res.contentType('application/json');
        res.send(JSON.stringify({ user: null }));
      }
    }
  },

  password: {
    everyauth: (function () {

      var registerPath = '/register',
          loginPath = '/login';

      function respondToGetMethod (req, res) {
        respond(res, { errors: ['Unsupported HTTP method.'] });
      }

      function respondToSucceed (res, user) {
        if (!user) return;
        respond(res, { user: user });
      }

      function respondToFail (req, res, errors) {
        if (!errors || !errors.length) return;
        respond(res, { errors: errors });
      }

      function respond (res, output) {
        res.contentType('application/json');
        res.send(JSON.stringify(output));
      }

      return {
        getRegisterPath: registerPath,
        displayRegister: respondToGetMethod,
        postRegisterPath: registerPath,
        respondToRegistrationSucceed: respondToSucceed,
        respondToRegistrationFail: respondToFail,
        getLoginPath: loginPath,
        displayLogin: respondToGetMethod,
        postLoginPath: loginPath,
        respondToLoginSucceed: respondToSucceed,
        respondToLoginFail: respondToFail
      };

    })()
  }
});
mongoose.model('User', UserSchema);

mongoose.connect('mongodb://localhost/test');

User = mongoose.model('User');


module.exports = UserSchema;
