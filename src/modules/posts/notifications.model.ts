// @ts-nocheck
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['Follow', 'Like'],
    default: 'Like',
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

NotificationSchema.pre(/^find/, function (next) {
  this.find().populate('user post');

  next();
});

const Notification = mongoose.model('Notification', NotificationSchema);

export default Notification;
