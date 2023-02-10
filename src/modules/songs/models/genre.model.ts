import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from '../../paginate/paginate';

const genreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    description: {
        type: String,
        default: ""
    },
    coverArt: { type: String, default: 'https://res.cloudinary.com/dln68reqa/image/upload/v1646384097/cld-sample.jpg' },
    coverArtId: { type: String, default: '' },

  },
  {
    timestamps: true,
  }
);




genreSchema.plugin(toJSON);
genreSchema.plugin(paginate);






const Genre = mongoose.model('Genre', genreSchema);

export default Genre;



