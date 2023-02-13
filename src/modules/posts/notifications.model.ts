// @ts-nocheck
import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import mongoosePaginate from 'mongoose-paginate-v2';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    to: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    type: {
      type: String,
      enum: ['Follow', 'Like', 'Album', 'Single', 'Playlist', 'Comment', 'Promotion'],
      default: 'Like',
    },
    message: String,
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Posts',
      default: null,
    },
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Playlist',
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      default: null,
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      default: null,
    },
    seen: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.plugin(toJSON);
notificationSchema.plugin(mongoosePaginate);

// notificationSchema.pre(/^find/, function (next) {
//   this.find().populate('user post');

//   next();
// });



const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
