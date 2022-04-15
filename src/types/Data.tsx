// external
import { v4 as uuidv4 } from 'uuid';

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
  songs: IDictSong;
}

export interface IDictSong {
  [index: string]: Song;
}

export interface IValidatorResult {
  valid: boolean;
  invalidMsg: string;
}

export class Song {
  constructor(id: string = uuidv4()) {
    this.id = id;
  }
  id: string;
  name: string = "";
  currentSongVersion?: SongVersion;
  previousSongVersions: SongVersion[] = [];
  [key: string]: Song[keyof Song];
}

export class SongVersion {
  constructor(songId: string, id: string = uuidv4()) {
    this.songId = songId;
    this.id = id;
  }
  id: string;
  songId: string; // Song which owns this SongVersion
  date: string; // other data type?
  name: string = "";
  url: string = "";
  [key: string]: SongVersion[keyof SongVersion];
}