import { Popover, PopoverInteractionKind, Position } from "@blueprintjs/core";
import React, { Component, FormEvent } from "react";
import ReactAudioPlayer from "react-audio-player";
import { INewSongVersionFormProps, INewSongVersionFormState, ISongCardProps, ISongCardState } from "../../../types";

export class SongCard extends Component<ISongCardProps, ISongCardState> {

  constructor(props: ISongCardProps) {
    super(props);   
    this.state = {
      addSongVersionPopoverOpen: false,
    }
  }

  closeAddSongVersionPopover = () => {
    this.setState({
      addSongVersionPopoverOpen: false,
    });
  }

  render() {
    const { song } = this.props;
    const songUrl = song.currentSongVersion ? song.currentSongVersion.url : "";
    return <div>
      {song.name}
      {songUrl ?
        <ReactAudioPlayer
          controls
          src={songUrl}>
        </ReactAudioPlayer>
        : null}
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