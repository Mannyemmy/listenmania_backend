import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  message: {
    type: String,
    required: [true, 'Message should not be empty'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  seen: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

MessageSchema.pre(/^find/, function (next) {
  this.find().populate('group');
  next();
});

const Message = new mongoose.model('Message', MessageSchema);

module.exports = Message;