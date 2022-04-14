// external
// import { v4 as uuidv4 } from 'uuid';

// internal

// this module defines data containers


/* Dictionaries */
export interface IDictProject {
  [index: string]: IProject;
}

export interface IDictBool {
  [index: string]: boolean;
}

export interface IUserInfo {
  patchNotification: string;
}

export interface IProject {
  appVersion: string | null;
  id: string;
  name: string;
  owner: string;
  deleted: boolean;
  test?: string;
  timeStamp: number;
}

export interface IValidatorResult {
  valid: boolean;
  invalidMsg: string;
}