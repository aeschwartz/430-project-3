const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getPosts', mid.requiresSecure, controllers.Post.getPosts);
  app.get('/getUser', mid.requiresSecure, controllers.Account.getUser);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  // app.get('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/me', mid.requiresLogin, (req, res) => {
    res.redirect(`/profile?user=${req.session.account.username}`);
  });
  app.get('/profile', mid.requiresSecure, controllers.Post.userPage);

  app.get('/create', mid.requiresLogin, controllers.Post.createPage);
  app.post('/post', mid.requiresLogin, controllers.Post.post);


  app.get('/settings', mid.requiresLogin, controllers.Account.settingsPage);
  app.post('/settings', mid.requiresLogin, controllers.Account.saveSettings);
  app.get('/', mid.requiresSecure, controllers.Post.homePage);

  app.get('/password', mid.requiresSecure, mid.requiresLogin, controllers.Account.pwChangePage);
  app.post('/password', mid.requiresSecure, mid.requiresLogin, controllers.Account.changePassword);
};

module.exports = router;
