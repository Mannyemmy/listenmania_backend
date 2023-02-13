import mongoose from 'mongoose';
import toJSON from '../../toJSON/toJSON';
import paginate from 'mongoose-paginate-v2';

function getMinAndSec(seconds : number){
  const min = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return min.toString().padStart(1, '0')+":"+secs.toString().padStart(2, '0');
}

const countries = ['AD','AE','AF','AG','AI','AL','AM','AO','AQ','AR','AS','AT','AU','AW','AX','AZ','BA','BB','BD','BE','BF','BG','BH','BI','BJ','BL','BM','BN','BO','BQ','BR','BS','BT','BV','BW','BY','BZ','CA','CC','CD','CF','CG','CH','CI','CK','CL','CM','CN','CO','CR','CU','CV','CW','CX','CY','CZ','DE','DJ','DK','DM','DO','DZ','EC','EE','EG','EH','ER','ES','ET','FI','FJ','FK','FM','FO','FR','GA','GB','GD','GE','GF','GG','GH','GI','GL','GM','GN','GP','GQ','GR','GS','GT','GU','GW','GY','HK','HM','HN','HR','HT','HU','ID','IE','IL','IM','IN','IO','IQ','IR','IS','IT','JE','JM','JO','JP','KE','KG','KH','KI','KM','KN','KP','KR','KW','KY','KZ','LA','LB','LC','LI','LK','LR','LS','LT','LU','LV','LY','MA','MC','MD','ME','MF','MG','MH','MK','ML','MM','MN','MO','MP','MQ','MR','MS','MT','MU','MV','MW','MX','MY','MZ','NA','NC','NE','NF','NG','NI','NL','NO','NP','NR','NU','NZ','OM','PA','PE','PF','PG','PH','PK','PL','PM','PN','PR','PS','PT','PW','PY','QA','RE','RO','RS','RU','RW','SA','SB','SC','SD','SE','SG','SH','SI','SJ','SK','SL','SM','SN','SO','SR','SS','ST','SV','SX','SY','SZ','TC','TD','TF','TG','TH','TJ','TK','TL','TM','TN','TO','TR','TT','TV','TW','TZ','UA','UG','UM','US','UY','UZ','VA','VC','VE','VG','VI','VN','VU','WF','WS','YE','YT','ZA','ZM','ZW']

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
      enum: countries,
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
