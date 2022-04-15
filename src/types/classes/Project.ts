// external
import { v4 as uuidv4 } from 'uuid';

// internal
import { APP_VERSION } from '../../constants';
import { IDictSong, IProject } from '../Data';

export class Project implements IProject {
  appVersion = APP_VERSION;
  id: string = uuidv4();
  name: string;
  owner: string;
  deleted = false;
  timeStamp: number = Date.now();
  songs: IDictSong;

  static fromIProject(iProject: IProject): Project {
    let project = new this(iProject.name, iProject.owner);
    project = Object.assign(project, iProject);
    return project;
  }

  constructor(name: string, owner: string) {
    this.name = name;
    this.owner = owner;
    this.songs = {};
  }

  get jsonData(): IProject {
    return JSON.parse(JSON.stringify(this));
  }

  updateTimeStamp = () => {
    this.timeStamp = Date.now();
    return this;
  }
}