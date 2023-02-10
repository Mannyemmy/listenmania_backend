import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from '../../paginate/paginate';

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    playlistType: {
      type: String,
      enum: ['private', 'public'],
      default: "public"
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Genre',
    },
    coverArt: { type: String, default: 'https://res.cloudinary.com/dln68reqa/image/upload/v1646384097/cld-sample.jpg' },
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
    subscribers: {
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

playlistSchema.plugin(toJSON);
playlistSchema.plugin(paginate);

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
