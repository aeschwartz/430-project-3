// js page for handling server routes related to the Domo model
const models = require('../models');

const Domo = models.Domo;

const makerPage = (req, res) => {
  Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), domos: docs });
  });
};

const getDomos = (req, res) => Domo.DomoModel.findByOwner(req.session.account._id, (err, docs) => {
  if (err) {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  }

  return res.json({ domos: docs });
});

const makeDomo = (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.teeth) {
    return res.status(400).json({ error: 'RAWR! All fields are required' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    teeth: req.body.teeth,
    owner: req.session.account._id,
  };

  const newDomo = new Domo.DomoModel(domoData);

  const domoPromise = newDomo.save();

  domoPromise.then(() => res.json({ redirect: '/maker' }));

  domoPromise.catch((err) => {
    console.log(err);

    if (err.code === 11000) {
      return res.status(400).json(
        { error: 'Domo already exists.' }
      );
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return domoPromise;
};


const editDomo = (req, res) => {
  // code for potential modular changes below: not used in the end

  // if(!req.body._id) {// if no id provided do nothing
  //   return res.status(400).json({error: 'RAWR! Domo ID required'})
  // }

  // const updateData = {};

  // // if data change, add it to update data
  // if(req.body.name) updateData.name = req.body.name;
  // if(req.body.age) updateData.age = req.body.age;
  // if(req.body.teeth) updateData.teeth = req.body.teeth;

  // // if none are changed, return an error
  // if (!req.body.name && !req.body.age && !req.body.teeth) {
  //   return res.status(400).json({ error: 'RAWR! At least one field is required' });
  // }


  // check if all fields
  if (!req.body.name || !req.body.age || !req.body.teeth || !req.body._id) {
    return res.status(400).json({ error: 'RAWR! All fields are required' });
  }

  // add all data to updatedata
  const updateData = {
    name: req.body.name,
    age: req.body.age,
    teeth: req.body.teeth,
  };

  const editPromise = Domo.DomoModel.findByIdAndUpdate(req.body._id, { $set: updateData });

  editPromise.then(() => res.json({ redirect: '/maker' }));

  editPromise.catch((err) => {
    console.log(err);
    return res.status(400).json({ error: 'An error occurred' });
  });

  return editPromise;
};

module.exports = {
  makerPage,
  editDomo,
  getDomos,
  make: makeDomo,
};
