import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: 'dln68reqa',
  api_key: '696529122214531',
  api_secret: '7zbd98l_-0yO8mfYspuqnlqRpxs',
});

export const fileUpload = async (file: Express.Multer.File) => {
  if (file.mimetype.slice(0, 5) === 'video') {
    return await cloudinary.v2.uploader.upload(file.path, {
      resource_type: 'video',
      end_offset: '30',
      video_codec: 'auto',
    });
  }
  if (file.mimetype.slice(0, 5) === 'audio') {
    const fName = file.originalname.split('.')[0];
    return await cloudinary.v2.uploader.upload(file.path, {
      resource_type: 'video',
      public_id: `AudioUploads/${fName}`,
    });
  }
  return await cloudinary.v2.uploader.upload(file.path);
};

export const fileDelete = async (fileId: string) => {
  cloudinary.v2.uploader.destroy(fileId);
};
