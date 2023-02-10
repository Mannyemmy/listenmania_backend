import mongoose from 'mongoose';
import toJSON from '../toJSON/index.ts';
import paginate from '../paginate/paginate.ts';

const artistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    stageName: {
      type: String,
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
      ref: 'Country',
      default: null
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'not specified'],
      default: 'not specified',
    },
    photo: {
      type: Object,
      default: 'https://res.cloudinary.com/dln68reqa/image/upload/v1646384075/sample.jpg',
    },
    songs: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Song',
        },
      ],
      default: [],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

artistSchema.plugin(toJSON);
artistSchema.plugin(paginate);

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;
