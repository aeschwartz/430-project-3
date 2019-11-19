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
      { error: 'All fields are required' }
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

    return res.json({ redirect: '/' });
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
      { error: 'All fields are required' }
    );
  }

  // check if passwords match
  if (pass !== pass2) {
    return res.status(400).json(
      { error: 'Passwords do not match' }
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
      res.json({ redirect: '/' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json(
          { error: 'Username already in use' }
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

const settingsPage = (req, res) => {
  res.render('settings', { csrfToken: req.csrfToken(), user: req.session.account });
};

const saveSettings = (req, res) => {
  if (!req.session.account) {
    return res.status(401).json({ error: 'User is not logged in' });
  }

  if (!req.body) {
    return res.status(400).json({ error: 'No settings changed' });
  }

  const property = req.body;
  delete property._csrf;

  const obj = req.session.account;
  const name = Object.keys(property)[0];
  if (
    name === 'color' ||
    name === 'accentColor' ||
    name === 'backgroundColor' ||
    name === 'fontFamilyHead' ||
    name === 'fontFamilyBody'
  ) {
    obj.style[name] = property[name];
  } else if (name === 'bio') {
    obj[name] = property[name];
  }
  const savePromise =
    Account.AccountModel.findByIdAndUpdate(req.session.account._id, { $set: obj });

  savePromise.then(() => res.json({ redirect: '/settings' }));

  savePromise.catch((err) => {
    console.log(err);

    return res.status(400).json({ error: 'An error occurred' });
  });

  return savePromise;
};

const getUser = (req, res) => {
  if (!req.query.user) {
    return res.status(400).json({ error: 'No user specified' });
  }

  return Account.AccountModel.findByUsername(req.query.user, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({
      user: {
        username: doc.username,
        bio: doc.bio,
        style: doc.style,
      },
    });
  });
};

const pwChangePage = (req, res) => {
  res.render('password', {
    csrfToken: req.csrfToken(),
    user: req.session.account,
  });
};

const changePassword = (req, res) => {
  // check for all fields
  if (!req.body.old || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // check if pass 1 == pass 2
  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // check if old password is valid
  const username = `${req.session.account.username}`;
  const password = `${req.body.old}`;
  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json(
        { error: 'Incorrect password' }
      );
    }

    return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
      const obj = {
        salt,
        password: hash,
      };

      const savePromise =
        Account.AccountModel.findByIdAndUpdate(req.session.account._id, { $set: obj });

      savePromise.then(() => res.redirect('/settings'));

      savePromise.catch((promiseErr) => {
        console.log(promiseErr);

        return res.status(400).json({ error: 'An error occurred' });
      });

      return savePromise;
    });
  });
};

module.exports = {
  loginPage,
  // signupPage,
  logout,
  login,
  signup,
  getToken,
  getUser,
  settingsPage,
  saveSettings,
  pwChangePage,
  changePassword,
};
