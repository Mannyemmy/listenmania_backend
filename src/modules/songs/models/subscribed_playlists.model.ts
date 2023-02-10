import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from '../../paginate/paginate';

const subscribedPlaylistSchema = new mongoose.Schema(
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

subscribedPlaylistSchema.plugin(toJSON);
subscribedPlaylistSchema.plugin(paginate);

const SubscribedPlaylist = mongoose.model('SubscribedPlaylist', subscribedPlaylistSchema);

export default SubscribedPlaylist;
