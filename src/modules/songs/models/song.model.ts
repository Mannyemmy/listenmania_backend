import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from 'mongoose-paginate-v2';

function getMinAndSec(seconds : number){
  const min = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return min.toString().padStart(1, '0')+":"+secs.toString().padStart(2, '0');
}

const songSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    artist: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      default: '',
    },
    featured: { type: Array, default: [] },
    producers: { type: Array, default: [] },
    contentType: {
      type: String,
      enum: ['explicit', 'clean'],
      default: 'clean',
    },
    release: { type: Date, default: new Date() },
    uploaded: { type: Date, default: new Date() },
    lyrics: {
      type: String,
      trim: true,
      default: '',
    },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      required: false,
      default: null,
    },
    genres: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
      },
    ],
    country: {
      type: String,
      default: 'NG',
    },
    trackLength: { type: Number, default: 0 },
    coverArt: { type: String, default: 'https://loremflickr.com/500/500/coverArt' },
    coverArtId: { type: String, default: '' },
    fileUrl: {
      type: String,
      trim: true,
    },
    fileId: {
      type: String,
      trim: true,
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
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  }
);

songSchema.virtual('duration').get(function () {
  return getMinAndSec(this.trackLength);
});

songSchema.plugin(toJSON);
songSchema.plugin(paginate);

const Song = mongoose.model('Song', songSchema);

export default Song;
