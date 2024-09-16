import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, callback) => {
      const extension = extname(file.originalname);
      const originalName = file.originalname.replace(extension, '');
      callback(null, `${originalName}${extension}`);
    },
  }),
};
