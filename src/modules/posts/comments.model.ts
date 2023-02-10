// @ts-nocheck
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import { toJSON } from '../toJSON';
import paginate from '../paginate/paginate';

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    posted_at: {
      type: Date,
      default: Date.now(),
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Posts',
    },
    reply: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        comment: {
          type: String,
        },
        like: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
commentSchema.plugin(toJSON);
commentSchema.plugin(paginate);

// commentSchema.virtual('replies', {
//             ref: 'Reply',
//             localField: '_id',
//             foreignField: 'comment'

// })

commentSchema.pre(/^find/, function (next: NextFunction) {
  this.find()
    .populate('user')
    .populate({
      path: 'likes',
      select: 'username user profile_pic _id',
    })
    .populate({
      path: 'reply.like',
      select: 'username user profile_pic _id',
    })
    .populate('reply.user');

  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
