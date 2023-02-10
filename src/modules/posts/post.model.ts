//@ts-nocheck
import mongoose from 'mongoose';
import toJSON from '../toJSON/toJSON';
import mongoosePaginate from 'mongoose-paginate-v2'
import paginate from '../paginate/paginate';

const postSchema = new mongoose.Schema(
  {
    posted_at: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    caption: {
      type: String,
      trim: true,
    },
    hashtag: Array,
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    post_type: String,
    post_files: Array,
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  },
  {
    // toJSON: { virtuals: true },
    // toObject: { virtuals: true },
    timestamps: true,
  }
);




postSchema.plugin(toJSON);
postSchema.plugin(mongoosePaginate);




// add plugin that converts mongoose to json


postSchema.pre('save', async function (next) {
  const post = this;
  const caption = post.caption.replace(/\s/g, '');
  const hashTagIndex = caption.indexOf('#');
  if (hashTagIndex === -1) {
    post.hashtag = undefined;
    return next();
  }
  const hashTagSplice = caption.slice(hashTagIndex);
  // let res= hashTagSplice.replace(/#/, '').split('#');

  post.hashtag = hashTagSplice.replace(/#/, '').split('#');
  next();
});

// postSchema.pre('find', async function (next) {


//   await this.find().populate('postComments');

//   next();
// });

const Post = mongoose.model('Posts', postSchema);

export default Post;



