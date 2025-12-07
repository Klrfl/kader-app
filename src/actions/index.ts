import { deleteStudentImage, markPrinted, uploadStudentImage } from "./images";
import { studentCreate, studentDelete, studentUpdate } from "./students";

export const server = {
  images: {
    uploadStudentImage: uploadStudentImage,
    deleteStudentImage: deleteStudentImage,
    markPrinted: markPrinted,
  },
  students: {
    update: studentUpdate,
    create: studentCreate,
    delete: studentDelete,
  },
};
