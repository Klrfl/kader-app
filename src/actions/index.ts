import { studentCreate, studentDelete, studentUpdate } from "./students";

export const server = {
  students: {
    update: studentUpdate,
    create: studentCreate,
    delete: studentDelete,
  },
};
