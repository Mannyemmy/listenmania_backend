import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from '../../paginate/paginate';

const albumSchema = new mongoose.Schema(
  {
    artist: String,
    name: {
      type: String,
      trim: true,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
    },
    coverArt: { type: String, default: 'https://res.cloudinary.com/dln68reqa/image/upload/v1646384075/sample.jpg' },
    coverArtId: { type: String, default: '' },
    likes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
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
    timestamps: true,
  }
);

albumSchema.plugin(toJSON);
albumSchema.plugin(paginate);

const Album = mongoose.model('Album', albumSchema);

export default Album;
