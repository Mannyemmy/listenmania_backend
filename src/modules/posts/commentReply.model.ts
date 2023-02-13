// @ts-nocheck
import { NextFunction } from 'express';
import mongoose from 'mongoose';
import { toJSON } from '../toJSON';
import paginate from '../paginate/paginate';

const commentReplySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    body: {
      type: String,
      required: [true, 'Comment is required'],
    },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
   
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
commentReplySchema.plugin(toJSON);
commentReplySchema.plugin(paginate);


const CommentReply = mongoose.model('CommentReply', commentReplySchema);

export default CommentReply;
