// js page for handling server routes related to the Account model
const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

// const signupPage = (req, res) => {
//   res.render('signup', { csrfToken: req.csrfToken() });
// };

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  // DATA VALIDATION
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json(
      { error: 'RAWR! All fields are required' }
    );
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json(
        { error: 'Wrong username or password' }
      );
    }

    const session = req.session;
    session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = (req, res) => {
  // DATA VALIDATION
  // convert to strings if not already, this way is more optimized
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  // check for ALL fields
  if (!username || !pass || !pass2) {
    return res.status(400).json(
      { error: 'RAWR! All fields are required' }
    );
  }

  // check if passwords match
  if (pass !== pass2) {
    return res.status(400).json(
      { error: 'RAWR! Passwords do not match' }
    );
  }

  // ENCRYPT PASSWORDS & CREATE DATA ENTRY
  return Account.AccountModel.generateHash(pass, (salt, hash) => {
    const accountData = {
      username,
      salt,
      password: hash,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      const session = req.session;
      session.account = Account.AccountModel.toAPI(newAccount);
      res.json({ redirect: '/maker' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json(
          { error: 'Username already in use.' }
        );
      }

      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

const getToken = (req, res) => {
  const csrfJSON = {
    csrfToken: req.csrfToken(),
  };

  res.json(csrfJSON);
};

module.exports = {
  loginPage,
  // signupPage,
  logout,
  login,
  signup,
  getToken,
};
