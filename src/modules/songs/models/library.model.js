import mongoose from 'mongoose';
import toJSON from '../toJSON/index.ts';
import paginate from '../paginate/paginate.ts';

const librarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Song',
    }
  },
  {
    timestamps: true,
  }
);

librarySchema.plugin(toJSON);
librarySchema.plugin(paginate);

const Library = mongoose.model('Library', librarySchema);

export default Library;
