import { uploadStudentImage } from "./images";
import { studentCreate, studentDelete, studentUpdate } from "./students";

export const server = {
  images: {
    uploadStudentImage: uploadStudentImage,
  },
  students: {
    update: studentUpdate,
    create: studentCreate,
    delete: studentDelete,
  },
};
