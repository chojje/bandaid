// external
import { Button, Card, Collapse, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core';
import React, { Component } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { set as _fpSet } from 'lodash/fp';
import { debounce as _debounce } from 'lodash';

// internal
import { ISongListPanelProps, ISongListPanelState, Song, INewSongFormProps, INewSongFormState, SongVersion } from '../../types';
import { SongCard } from './cards/SongCard';
export class SongListPanel extends Component<ISongListPanelProps, ISongListPanelState> {
  constructor(props: ISongListPanelProps) {
    super(props);
    this.state = {
      project: props.project,
      songIsOpen: {},
      addSongPopoverOpen: false,
    }

  }

  componentDidMount() {
    const songIsOpen = Object.keys(this.props.project.songs).reduce((a,v) => ({...a, [v]: false}), {});
    this.setState({ songIsOpen });
  }

  // todo: this function should be able to tell if a local or root path is provided and act accordingly
  // todo: it's also inappropriately named
  handleChange = (path: string, value: any) => {
    const newState = _fpSet(path, value, this.state);
    this.setState(newState);
    this.updateProjectDebounce();
  }
  updateProject = () => this.props.updateProject(this.state.project);
  updateProjectDebounce = _debounce(this.updateProject, 1000);

  setStateAndUpdate = (newState: ISongListPanelState) => {
    this.setState(newState);
    this.updateProjectDebounce();
  }

  performDatabaseOperation = (checkValidOperation: (newState: ISongListPanelState) => boolean, operation: (newState: ISongListPanelState) => void) => {
    let newState = { ...this.state };
    if (!checkValidOperation(newState)) return;
    operation(newState); // we allow this operation to mutate the newState object
    this.setStateAndUpdate(newState);
  }

  addSong = (name: string) => {
    const valid = (newState: ISongListPanelState) => {
      return true;
    }

    const operation = (newState: ISongListPanelState) => {
      const song = new Song();
      song.name = name;
      newState.project.songs[song.id] = song;
    }

    this.performDatabaseOperation(valid, operation);
  }

  closeAddSongPopover = () => {
    this.setState({
      addSongPopoverOpen: false,
    });
  }

  handleOpenSong = (e: React.MouseEvent<HTMLElement>, songId: string) => {
    let newState = { ...this.state };
    newState.songIsOpen[songId] = !newState.songIsOpen[songId];
    this.setState(newState);
  }

  addSongVersion = (name: string, songId: string, url: string) => {
    const valid = (newState: ISongListPanelState) => {
      return true;
    }

    const operation = (newState: ISongListPanelState) => {
      const song = newState.project.songs[songId];
      const songVersion = Object.assign(new SongVersion(songId), { name, url});
      
      if (song.currentSongVersion) {
        if (song.previousSongVersions) {
          song.previousSongVersions = [song.currentSongVersion, ...song.previousSongVersions];
        } else {
          song.previousSongVersions = [song.currentSongVersion];
        }
      }

      song.currentSongVersion = songVersion;

      newState.project.songs[song.id] = song;
    }

    this.performDatabaseOperation(valid, operation);
  }

  render() {
    const { project } = this.props;
    return (
      <div>
        <h1>{this.props.title}</h1>
        {
          Object.keys(project.songs).map((songId) => {
            const song = project.songs[songId];
            const songOpen = this.state.songIsOpen[songId]
            return (
              <Card key={`${songId}-card`} id={`${songId}-card`} elevation={songOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
                <div className="panel-card-header" onClick={(e: React.MouseEvent<HTMLElement>) => this.handleOpenSong(e, songId)}>
                  <h3 style={{ flexGrow: 1 }}>{song.name}</h3>
                  <Button minimal className="bp3-button" icon={songOpen ? "arrow-up" : "arrow-down"}/>
                </div>
                <Collapse key={`${songId}-collapse`} isOpen={songOpen}>
                  <SongCard song={song} renderFileUploader={this.props.renderFileUploader} addSongVersion={this.addSongVersion}/>
                </Collapse>
              </Card>
            )
          })
        }
        <div className="project-list-footer">
          <Popover
            content={(
              <NewSongForm
                addSong={this.addSong}
                postSubmitHandler={this.closeAddSongPopover} />)}
            interactionKind={PopoverInteractionKind.CLICK}
            isOpen={this.state.addSongPopoverOpen}
            onInteraction={(state) => this.setState({ addSongPopoverOpen: state })}
            position={Position.BOTTOM}>
            <button className="bp3-button bp3-icon-add add-song-button" aria-label="add new song">Add new Song</button>
          </Popover>
        </div>
        
      </div>
    )
  }
}

export class NewSongForm extends Component<INewSongFormProps, INewSongFormState> {
  songForm: HTMLFormElement;
  nameInput: HTMLInputElement;

  constructor(props: INewSongFormProps) {
    super(props);
    this.state = { };
  }

  createSong = (event: React.FormEvent) => {
    event.preventDefault();

    const name = this.nameInput.value;
    this.props.addSong(name);

    this.songForm.reset();
    this.props.postSubmitHandler();
  }

  render() {
    return (
      <div className="new-project-div">
        <form className="new-project-form" onSubmit={(event) => this.createSong(event)} ref={(form) => this.songForm = form!}>
          <label className="bp3-label">
            Song name
            <input className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder="Song name"></input>
          </label>
        </form>
      </div>
    )
  }
}