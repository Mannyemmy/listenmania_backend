import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from 'mongoose-paginate-v2';

const likedSongSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

likedSongSchema.plugin(toJSON);
likedSongSchema.plugin(paginate);

const LikedSong = mongoose.model('LikedSong', likedSongSchema);

export default LikedSong;
