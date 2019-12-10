const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// const _ = require('underscore');

let PostModel = {};

const convertId = mongoose.Types.ObjectId;

const PostSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  postTitle: {
    type: String,
    trim: true,
  },

  postBody: {
    type: String,
    required: true,
    trim: true,
  },

  createdDate: {
    type: Date,
    default: Date.now,
  },

  replyTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
  },
});

PostSchema.statics.toAPI = (doc) => ({
  postTitle: doc.postTitle,
  postBody: doc.postBody,
  date: doc.createdDate,
});

PostSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return PostModel.find(search).exec(callback);
};

PostModel = mongoose.model('Post', PostSchema);

module.exports = {
  PostModel,
  PostSchema,
  convertId,
};
