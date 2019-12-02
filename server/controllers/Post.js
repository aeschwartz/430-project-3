// js page for handling server routes related to the Post model
const models = require('../models');

const Post = models.Post;

const homePage = (req, res) =>
  res.render('app', {
    csrfToken: req.csrfToken(),
    user: req.session.account,
  });

const userPage = (req, res) => {
  // if no user specified, then just go to home feed
  if (!req.query.user) return res.redirect('/');

  return models.Account.AccountModel.findByUsername(req.query.user, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    const userJson = {
      user: {
        username: doc.username,
        bio: doc.bio,
        style: doc.style,
      },
    };

    return res.render('profile',
      { csrfToken: req.csrfToken(), profile: userJson, user: req.session.account }
    );
  });
};

const getPosts = (req, res) => {
  // if no user specified, return all posts
  if (!req.query.user) {
    return Post.PostModel.find((err, docs) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ error: 'An error occurred' });
      }

      return models.Account.AccountModel.find((accErr, accDoc) => {
        if (accErr) {
          console.log(accErr);
          return res.status(400).json({ error: 'An error occurred' });
        }

        // perhaps not the most efficient way of doing this, but whatever at this point
        const returnDocs = [];
        for (let i = 0; i < docs.length; i++) {
          returnDocs.push({
            postBody: docs[i].postBody,
            createdDate: docs[i].createdDate,
          });

          if (docs[i].postTitle) returnDocs[i].postTitle = docs[i].postTitle;

          for (let j = 0; j < accDoc.length; j++) {
            if (docs[i].owner.toString() === accDoc[j]._id.toString()) {
              returnDocs[i].owner = {
                username: accDoc[j].username,
                style: accDoc[j].style,
              };
              break;
            }
          }
        }

        return res.json({ posts: returnDocs });
      });
    });
  }

  // else
  return models.Account.AccountModel.findByUsername(req.query.user, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    if (!doc) {
      return res.status(400).json({ error: 'No user with specified username found' });
    }

    // else
    return Post.PostModel.findByOwner(doc._id, (postErr, docs) => {
      if (postErr) {
        console.log(postErr);
        return res.status(400).json({ error: 'An error occurred' });
      }

      return res.json({ posts: docs });
    });
  });
};

const createPage = (req, res) => {
  const obj = {
    csrfToken: req.csrfToken(),
    user: req.session.account,
  };

  if(req.query.replyId) obj.replyId = req.query.replyId;

  res.render('create', obj);
};


const makePost = (req, res) => {
  if (!req.body.postBody) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const postData = {
    postBody: req.body.postBody,
    owner: req.session.account._id,
  };

  if (req.body.postTitle) postData.postTitle = req.body.postTitle;

  const newPost = new Post.PostModel(postData);

  const postPromise = newPost.save();

  postPromise.then(() => res.redirect('/me'));

  postPromise.catch((err) => {
    console.log(err);

    // no unique post attributes:
    // if (err.code === 11000) {
    //   return res.status(400).json(
    //     { error: 'Post already exists.' }
    //   );
    // }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return postPromise;
};


// const editDomo = (req, res) => {
//   // code for potential modular changes below: not used in the end

//   // if(!req.body._id) {// if no id provided do nothing
//   //   return res.status(400).json({error: 'RAWR! Domo ID required'})
//   // }

//   // const updateData = {};

//   // // if data change, add it to update data
//   // if(req.body.name) updateData.name = req.body.name;
//   // if(req.body.age) updateData.age = req.body.age;
//   // if(req.body.teeth) updateData.teeth = req.body.teeth;

//   // // if none are changed, return an error
//   // if (!req.body.name && !req.body.age && !req.body.teeth) {
//   //   return res.status(400).json({ error: 'RAWR! At least one field is required' });
//   // }


//   // check if all fields
//   if (!req.body.name || !req.body.age || !req.body.teeth || !req.body._id) {
//     return res.status(400).json({ error: 'RAWR! All fields are required' });
//   }

//   // add all data to updatedata
//   const updateData = {
//     name: req.body.name,
//     age: req.body.age,
//     teeth: req.body.teeth,
//   };

//   const editPromise = Post.DomoModel.findByIdAndUpdate(req.body._id, { $set: updateData });

//   editPromise.then(() => res.json({ redirect: '/maker' }));

//   editPromise.catch((err) => {
//     console.log(err);
//     return res.status(400).json({ error: 'An error occurred' });
//   });

//   return editPromise;
// };

module.exports = {
  userPage,
  homePage,
  getPosts,
  post: makePost,
  createPage,
};
