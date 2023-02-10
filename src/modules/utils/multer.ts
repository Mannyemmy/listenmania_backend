import httpStatus from 'http-status';
import multer from 'multer';
import path from 'path';
import ApiError from '../errors/ApiError';
export const upload = multer({
  storage: multer.diskStorage({}),
  fileFilter: (req: any, file: any, cb: any) => {
    let ext = path.extname(file.originalname);
    if (
      ext !== '.jpg' &&
      ext !== '.jpeg' &&
      ext !== '.png' &&
      ext !== '.mp4' &&
      ext !== '.mp3' &&
      ext !== '.flac' &&
      ext !== '.wav' &&
      ext !== '.aiff' &&
      ext !== '.ogg' &&
      ext !== '.m4a'
    ) {
      // cb(new Error(`File type ${ext} not supported`), false)
      return cb(new ApiError(httpStatus.BAD_REQUEST, `File type ${ext} not supported`));
    }
    cb(null, true);
  },
});
