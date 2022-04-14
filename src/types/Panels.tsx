import { ChangeEvent } from "react";
import { IProject } from "./Data";

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
 }

export interface ISongListPanelState extends IPanelState { }