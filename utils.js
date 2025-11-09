import path from "node:path";
import { exit } from "node:process";

/**
 * get path used in pictures
 * @returns string
 * */
export const getPicturesPath = () => {
  if (!process.env.FILE_PATH) {
    console.error("don't forget to set FILE_PATH in your .env file");
    exit();
  }

  return path.resolve(process.env.FILE_PATH);
};

// TODO: use an sqlite database or something
/**
 * get all groups at kaderisasi
 * @returns string[]
 * */
export const getGroups = () => [
  "adarna",
  "anqa",
  "bennu",
  "caladrius",
  "huma",
  "sankova",
  "simurgh",
];
