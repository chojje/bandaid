import { Button, Card, Collapse, Popover, PopoverInteractionKind, Position } from "@blueprintjs/core";
import React, { ChangeEvent, Component, FormEvent } from "react";
import ReactAudioPlayer from "react-audio-player";
import { INewSongVersionFormProps, INewSongVersionFormState, ISongCardProps, ISongCardState, Song } from "../../../types";

export class SongCard extends Component<ISongCardProps, ISongCardState> {

  constructor(props: ISongCardProps) {
    super(props);   
    this.state = {
      addSongVersionPopoverOpen: false,
      songVersionsOpen: false,
    }
  }

  handleVolumeChange = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    this.props.handleVolumeChange(target.volume);
  }

  closeAddSongVersionPopover = () => {
    this.setState({
      addSongVersionPopoverOpen: false,
    });
  }

  handleOpenSongVersions = () => {
    this.setState({ songVersionsOpen: !this.state.songVersionsOpen })
  }

  render() {
    const { song } = this.props;
    const songId = song.id;
    const { songVersionsOpen } = this.state;
    const songUrl = song.currentSongVersion ? song.currentSongVersion.url : "";
    return <div className="song-card">
      <SongInfoEdit
        value={song.name} 
        label="Song name"
        path={`project.songs.${this.props.song.id}.name`}
        handleChange={this.props.handleChange}/>
      
      {songUrl ?
      <>
        <SongInfoEdit
          value={song.currentSongVersion!.name} 
          label="Current version name"
          path={`project.songs.${this.props.song.id}.currentSongVersion.name`}
          handleChange={this.props.handleChange}/>
        <ReactAudioPlayer
          controls
          volume={this.props.volume}
          onVolumeChanged={this.handleVolumeChange}
          src={songUrl}/>
        <>{song.previousSongVersions.length?
          <Card key={`${songId}-versions-card`} id={`${songId}-versions-card`} elevation={songVersionsOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
          <div className="panel-card-header" onClick={this.handleOpenSongVersions}>
            <h3 style={{ flexGrow: 1 }}>Previous versions</h3>
            <Button minimal className="bp3-button" icon={songVersionsOpen ? "arrow-up" : "arrow-down"}/>
          </div>
          <Collapse key={`${songId}-collapse`} isOpen={songVersionsOpen}>
            <SongVersionList
              song={song}
              handleChange={this.props.handleChange}
              volume={this.props.volume} 
              handleVolumeChange={this.handleVolumeChange}/>
          </Collapse>
        </Card> : null}</>
      </> : <div>No versions have been added for this song.</div>}
      
      <div className="song-card-footer">
        <Popover
          content={(
            <NewSongVersionForm
              renderFileUploader={this.props.renderFileUploader}
              addSongVersion={this.props.addSongVersion}
              postSubmitHandler={this.closeAddSongVersionPopover}
              songId={song.id} />)}
          interactionKind={PopoverInteractionKind.CLICK}
          isOpen={this.state.addSongVersionPopoverOpen}
          onInteraction={(state) => this.setState({ addSongVersionPopoverOpen: state })}
          position={Position.BOTTOM}>
          <button className="bp3-button bp3-icon-add add-song-version-button" aria-label="add new song version">Add new Version</button>
        </Popover>
      </div>
    </div>;
  }
}

export class NewSongVersionForm extends Component<INewSongVersionFormProps, INewSongVersionFormState> {
  songForm: HTMLFormElement;
  nameInput: HTMLInputElement;

  constructor(props: INewSongVersionFormProps) {
    super(props);
    this.state = {
      songUrl: "",
    };
  }

  createSongVersion = (event: React.FormEvent) => {
    event.preventDefault();

    const name = this.nameInput.value;
    this.props.addSongVersion(name, this.props.songId, this.state.songUrl);

    this.songForm.reset();
    this.props.postSubmitHandler();
  }

  onFileUploaded = (url: string) => {
    this.setState({
      songUrl: url,
    })
  }

  render() {
    return (
      <div className="new-project-div">
        {this.props.renderFileUploader(this.onFileUploaded)}
        <form className="new-project-form" onSubmit={(event) => this.createSongVersion(event)} ref={(form) => this.songForm = form!}>
          <label className="bp3-label">
            Version name
            <input disabled={!this.state.songUrl} className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder="Song name"></input>
          </label>
        </form>
      </div>
    )
  }
}

interface ISongInfoEditProps {
  label: string;
  value: string;
  path: string;
  handleChange(path: string, value: string): void;
}

interface ISongInfoEditState {
  edit: boolean;
}

export class SongInfoEdit extends Component<ISongInfoEditProps, ISongInfoEditState> {
  constructor(props: ISongInfoEditProps) {
    super(props);
    this.state = {
      edit: false,
    };
  }

  toggleEdit = () => {
    this.setState({
      edit: !this.state.edit,
    })
  }

  handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    this.props.handleChange(this.props.path, e.target.value);
  }

  render() {
    return (<div>
      {this.props.label}: { this.state.edit? <input className="bp3-input" name="name" type="text" placeholder={this.props.value} onChange={this.handleChange}></input>
      : this.props.value }
      <button className="bp3-button bp3-minimal bp3-icon-edit" aria-label="project settings" onClick={this.toggleEdit}/>
    </div>)
  }
}

interface ISongVersionListProps {
  song: Song;
  volume: number;
  handleChange(path: string, value: string): void;
  handleVolumeChange(e: Event): void;
}

export class SongVersionList extends Component<ISongVersionListProps> {
  render() {
    const { song, volume, handleVolumeChange, handleChange } = this.props;
    return song.previousSongVersions.map((version, i) => {
      const versionUrl = version.url;
      return <>
        <SongInfoEdit
          value={version.name} 
          label="Version name"
          path={`project.songs.${song.id}.previousSongVersions.${i}.name`}
          handleChange={handleChange}/>
        <ReactAudioPlayer
          controls
          volume={volume}
          onVolumeChanged={handleVolumeChange}
          src={versionUrl}/>
        </>
    })
  }
}