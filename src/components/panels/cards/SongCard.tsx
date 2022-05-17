import { Alert, Button, Card, Collapse, Intent, Popover, PopoverInteractionKind, Position } from "@blueprintjs/core";
import React, { ChangeEvent, Component, FormEvent } from "react";
import ReactAudioPlayer from "react-audio-player";
import { AppToaster } from "../../../toaster";
import { INewSongVersionFormProps, INewSongVersionFormState, ISongCardProps, ISongCardState, Song, SongComment, SongVersion } from "../../../types";

export class SongCard extends Component<ISongCardProps, ISongCardState> {

  constructor(props: ISongCardProps) {
    super(props);   
    this.state = {
      addSongVersionPopoverOpen: false,
      addCommentPopoverOpen: false,
      deleteSongWarningOpen: false,
      songVersionsOpen: false,
      commentsOpen: false,
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

  closeAddCommentPopover = () => {
    this.setState({
      addCommentPopoverOpen: false,
    });
  }

  handleOpenSongVersions = () => {
    this.setState({ songVersionsOpen: !this.state.songVersionsOpen })
  }

  handleOpenComments = () => {
    this.setState({ commentsOpen: !this.state.commentsOpen })
  }

  handleAlertOpen = () => this.setState({ deleteSongWarningOpen: true });
  handleAlertCancel = () => this.setState({ deleteSongWarningOpen: false });
  handleAlertConfirm = () => {
    this.setState({ deleteSongWarningOpen: false });
    this.props.deleteSong(this.props.song.id);
  }

  audioPlayer = (url: string, name: string) => {
    return <ReactAudioPlayer
      title={name}
      controls
      className="audio-player"
      volume={this.props.volume}
      onVolumeChanged={this.handleVolumeChange}
      src={url}/>
  }

  renderComment = (comment: SongComment) => {
    return (
      <div key={`comment-${comment.id}-div`}>
        <div>{comment.author}{comment.timestamp? ` @${comment.timestamp}` : ""}</div>
        <div>{comment.text}</div>
      </div>
    )
  }

  renderCommentList = (songVersion: SongVersion, footer?: JSX.Element) => {
    return (
      <>
        <div className="comment-list-div">
          {songVersion!.comments && songVersion!.comments.length?
            songVersion!.comments.map(comment => {
              return this.renderComment(comment)
            }) : <div>No comments have been added for this Song Version</div>
          }
        </div>
        {footer? footer : null}
      </>
    )
  }

  addCommentButton = (songId: string) => {
    return (
      <div className="comment-list-footer">
        <Popover
          content={
            <NewCommentForm
              addComment={this.props.addComment}
              postSubmitHandler={this.closeAddCommentPopover}
              songId={songId} />}
              interactionKind={PopoverInteractionKind.CLICK}
              isOpen={this.state.addCommentPopoverOpen}
              onInteraction={(state) => this.setState({ addCommentPopoverOpen: state })}
              position={Position.BOTTOM}>
          <Button icon="comment">Add comment</Button>
        </Popover>
      </div>
    )
  }

  render() {
    const { song, handleChange } = this.props;
    const songId = song.id;
    const { songVersionsOpen, commentsOpen } = this.state;
    const songUrl = song.currentSongVersion ? song.currentSongVersion.url : "";
    const previousVersions = song.previousSongVersions;
    return <div className="song-card">
      <SongInfoEdit
        value={song.name} 
        label="Song name"
        path={`project.songs.${song.id}.name`}
        handleChange={handleChange}/>
      
      {songUrl ?
      <>
        <SongInfoEdit
          value={song.currentSongVersion!.name} 
          label="Current version name"
          path={`project.songs.${song.id}.currentSongVersion.name`}
          handleChange={handleChange}/>
        {this.audioPlayer(songUrl, song.name)}
        <Card key={`${songId}-versions-card`} id={`${songId}-versions-card`} elevation={commentsOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
          <div className="panel-card-header" onClick={this.handleOpenComments}>
            <h3 style={{ flexGrow: 1 }}>Comments</h3>
            <Button minimal className="bp3-button" icon={commentsOpen ? "arrow-up" : "arrow-down"}/>
          </div>
          <Collapse key={`${songId}-collapse`} isOpen={commentsOpen}>
            {this.renderCommentList(song.currentSongVersion!, this.addCommentButton(song.id))}
          </Collapse>
        </Card>
        <>
        { previousVersions && previousVersions.length?
          <Card key={`${songId}-versions-card`} id={`${songId}-versions-card`} elevation={songVersionsOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
            <div className="panel-card-header" onClick={this.handleOpenSongVersions}>
              <h3 style={{ flexGrow: 1 }}>Previous versions</h3>
              <Button minimal className="bp3-button" icon={songVersionsOpen ? "arrow-up" : "arrow-down"}/>
            </div>
            <Collapse key={`${songId}-collapse`} isOpen={songVersionsOpen}>
              <SongVersionList
                audioPlayer={this.audioPlayer}
                song={song}
                handleChange={handleChange}
                deleteSongVersion={this.props.deleteSongVersion}
                renderCommentList={this.renderCommentList}
                />
            </Collapse>
          </Card> : null
        }</>
      </> : <div className="no-versions-div">No versions have been added for this song.</div>}
      
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
          <Button icon="add">Add new Version</Button>
        </Popover>
        <Button icon="delete" onClick={this.handleAlertOpen}>Delete song</Button>
        <Alert
          cancelButtonText="Cancel"
          confirmButtonText="Delete song"
          intent={Intent.DANGER}
          isOpen={this.state.deleteSongWarningOpen}
          onCancel={this.handleAlertCancel}
          onConfirm={() => this.handleAlertConfirm()}
        >
          <p>
            Are you sure you want to delete this song and all versions? This action is irreversible!
          </p>
        </Alert>
      </div>
    </div>;
  }
}

export interface INewCommentFormState {
}

export interface INewCommentFormProps {
  addComment: (author: string, timestamp: string, comment: string, songId: string) => void;
  postSubmitHandler: any;
  songId: string;
}

export class NewCommentForm extends Component<INewCommentFormProps, INewCommentFormState> {
  commentForm: HTMLFormElement;
  authorInput: HTMLInputElement;
  timestampInput: HTMLInputElement;
  commentTextArea: HTMLTextAreaElement;

  /*
  constructor(props: INewCommentFormProps) {
    super(props);
  }
  */

  createComment = (event: React.FormEvent) => {
    event.preventDefault();
    const author = this.authorInput.value;
    const timestamp = this.parseTimestamp(this.timestampInput.value);

    const comment = this.commentTextArea.value;
    if (comment) {
      this.props.addComment(author, timestamp, comment, this.props.songId);
    }
    this.commentForm.reset();
    this.props.postSubmitHandler();
  }

  parseTimestamp = (timestamp: string) => {
    const timestampTest = /\d\d:\d\d/
    if (!timestampTest.test(timestamp)) {
      AppToaster.show({ intent: Intent.DANGER, message: "Timestamp format must be \"mm:ss\"."})
      return "";
    } else {
      return timestamp;
    }
     
  }

  cancelComment = (event: React.FormEvent) => {
    event.preventDefault();
    this.props.postSubmitHandler();
  }

  render() {
    return (
      <div className="new-project-div">
        <form className="new-project-form" onSubmit={(e) => this.createComment(e)} onReset={(e) => this.cancelComment(e)} ref={(form) => this.commentForm = form!}>
          <label className="bp3-label">
            Author
            <input className="bp3-input" name="name" type="text" ref={(input) => { this.authorInput = input! }} placeholder="Author"></input>
          </label>
          <label className="bp3-label">
            Timestamp
            <input className="bp3-input" name="name" type="text" ref={(input) => { this.timestampInput = input! }} placeholder="Timestamp"></input>
          </label>
          <label className="bp3-label">
            Comment
            <textarea className="bp3-input" name="name" ref={(input) => { this.commentTextArea = input! }} placeholder="Comment"></textarea>
          </label>
          <div className="form-footer">
            <Button type="submit" icon="add">Save Comment</Button>
            <Button type="reset" icon="reset">Cancel</Button>
          </div>
        </form>
      </div>
    )
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
    
    if (this.state.songUrl) {
      this.props.addSongVersion(name, this.props.songId, this.state.songUrl);
    }

    this.songForm.reset();
    this.props.postSubmitHandler();
  }

  cancelSongVersion = (event: React.FormEvent) => {
    event.preventDefault();
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
        <form className="new-project-form" onSubmit={(event) => this.createSongVersion(event)} onReset={(e) => this.cancelSongVersion(e)} ref={(form) => this.songForm = form!}>
          {this.props.renderFileUploader(this.onFileUploaded)}
          <label className="bp3-label">
            Version name
            <input disabled={!this.state.songUrl} className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder="Song name"></input>
          </label>
          <div className="form-footer">
            <Button type="submit" disabled={!this.state.songUrl} icon="add">Save Song Version</Button>
            <Button type="reset" icon="reset">Cancel</Button>
          </div>
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
  handleChange(path: string, value: string): void;
  deleteSongVersion(songId: string, versionId: string): void;
  audioPlayer(url: string, name: string): JSX.Element;
  renderCommentList(songVersion: SongVersion, footer?: JSX.Element): JSX.Element;
}

interface ISongVersionListState {
  deleteSongVersionWarningOpen: boolean;
}

export class SongVersionList extends Component<ISongVersionListProps, ISongVersionListState> {

  constructor(props: ISongVersionListProps) {
    super(props);
    this.state = {
      deleteSongVersionWarningOpen: false,
    }
  }
  
  handleAlertOpen = () => this.setState({ deleteSongVersionWarningOpen: true });
  handleAlertCancel = () => this.setState({ deleteSongVersionWarningOpen: false });
  handleAlertConfirm = (versionId: string) => {
    this.setState({ deleteSongVersionWarningOpen: false });
    this.props.deleteSongVersion(this.props.song.id, versionId);
  }

  render() {
    const { song,handleChange, audioPlayer } = this.props;
    return song.previousSongVersions.map((version, i) => {
      const versionUrl = version.url;
      return <div key={`song-version-${i}-div`} className="song-version-div">
        <SongInfoEdit
          value={version.name} 
          label="Version name"
          path={`project.songs.${song.id}.previousSongVersions.${i}.name`}
          handleChange={handleChange}/>
        {audioPlayer(versionUrl, song.name)}
        {this.props.renderCommentList(version)}
        <div className="song-version-footer">  
          <Button icon="delete" onClick={this.handleAlertOpen} className="narrow-delete-button">Delete song version</Button>
          <Alert
            cancelButtonText="Cancel"
            confirmButtonText="Delete song version"
            intent={Intent.DANGER}
            isOpen={this.state.deleteSongVersionWarningOpen}
            onCancel={this.handleAlertCancel}
            onConfirm={() => this.handleAlertConfirm(version.id)}
            >
            <p>
              Are you sure you want to delete this song version? This action is irreversible!
            </p>
          </Alert>
        </div>
      </div>
    })
  }
}