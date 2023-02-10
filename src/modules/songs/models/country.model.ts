import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from '../../paginate/paginate';

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    iso: {
      type: String,
      trim: true,
      default: ""
    },
    flag: { type: String, default: 'https://res.cloudinary.com/dln68reqa/image/upload/v1646384075/sample.jpg' },
  },
  {
    timestamps: true,
  }
);

countrySchema.plugin(toJSON);
countrySchema.plugin(paginate);

const Country = mongoose.model('Country', countrySchema);

export default Country;
