import { ChangeEvent, ReactNode } from "react";
import { IDictBool, IProject, Song } from "./Data";

/* Panels */

export interface IPanelProps {
  title: string;
}

export interface IPanelState { }

export type TInputType = StringConstructor | NumberConstructor;

export interface IInput {
  key: string;
  disabled?: boolean;
  label: string;
  path?: string;
  info?: string;
}

export interface IInputField extends IInput {
  type: TInputType;
  buttonLabel?: string;
  localPath?: string;
  rootPath?: string;
  handleChange?(e: ChangeEvent<HTMLInputElement>): void;
}

export interface ISongListPanelProps extends IPanelProps {
  project: IProject;
  updateProject(project: IProject): void;
  renderFileUploader: ((callback: (url: string) => void) => ReactNode);
}

export interface ISongListPanelState extends IPanelState {
  project: IProject;
  addSongPopoverOpen: boolean;
  songIsOpen: IDictBool;
  volume: number;
}

export interface INewSongFormState { }

export interface INewSongFormProps {
  addSong(value: string): void;
  postSubmitHandler: any;
}

export interface ISongCardProps {
  song: Song;
  renderFileUploader: ((callback: (url: string) => void) => ReactNode)
  addSongVersion(name: string, songId: string, url: string): void;
  addComment(author: string, timestamp: string, comment: string, songId: string): void;
  handleChange(path: string, value: string): void;
  handleVolumeChange(volume: number): void;
  deleteSong(id: string): void;
  deleteSongVersion(songId: string, versionId: string): void;
  volume: number;
}

export interface ISongCardState {
  addSongVersionPopoverOpen: boolean;
  addCommentPopoverOpen: boolean;
  deleteSongWarningOpen: boolean;
  songVersionsOpen: boolean;
  commentsOpen: boolean;
}

export interface INewSongVersionFormState {
  songUrl: string;
}

export interface INewSongVersionFormProps {
  renderFileUploader: ((callback: (url: string) => void) => ReactNode);
  addSongVersion(name: string, songId: string, url: string): void;
  postSubmitHandler: any;
  songId: string;
}