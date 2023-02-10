import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from '../../paginate/paginate';

const likedPlaylistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    playlists: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Playlist',
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

likedPlaylistSchema.plugin(toJSON);
likedPlaylistSchema.plugin(paginate);

const LikedPlaylist = mongoose.model('LikedPlaylist', likedPlaylistSchema);

export default LikedPlaylist;
