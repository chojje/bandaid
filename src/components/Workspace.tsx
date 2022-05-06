// external
import React, { Component, ReactText, FormEvent } from 'react';
import classNames from 'classnames'
// @ts-ignore
import { Breadcrumb, Classes, ProgressBar, Tab, Tabs, Intent, FileInput, IToastProps } from '@blueprintjs/core';
import firebase from 'firebase/app';
import 'firebase/storage';

// internal
import { IWorkspaceState, IWorkspaceProps } from '../types/index';
import { AppToaster } from '../toaster';
import { SongListPanel } from './Panels';


export class Workspace extends Component<IWorkspaceProps, IWorkspaceState> {
  progressToaster: string = "";
  
  constructor(props: IWorkspaceProps) {
    super(props);

    this.state = {
      project: props.item,
      tabId: "song-list",
      uploadProgress: 0,
    }
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps: IWorkspaceProps) {
    if (this.props.item !== prevProps.item) {
      this.setState({ project: this.props.item });
    }
  }

  handleTabChange = (tabId: ReactText, oldTab: ReactText, e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    this.setState({ tabId });
  }

  formatValue = () => {
    return { __html: `The value in the text box is "${this.props.item.name}"` };
  }

  renderFileUploader = (callback: (url: string) => void) => {
    return (  
      <div>
        <FileInput
          text={ "Choose file..." }
          onInputChange={(e) => { 
            this.handleFileInput(e, callback);
          }} 
          inputProps={{ accept: "audio/*" }}/>
      </div>  
    )
  }

  handleFileInput = (e: FormEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const input = e.target as HTMLInputElement;
    if (input && input.files && input.files.length) {
      this.startUpload(input.files[0], callback);
    }
  }

  startUpload = (f: File, callback: (url: string) => void) => {
    this.handleUploadStart();
    const storageRef = firebase.storage().ref(`audio/${this.props.currentUser!.uid}`);
    const fileRef = storageRef.child(f.name);
    const uploadTask = fileRef.put(f);
    uploadTask.on('state_changed', (snapshot: firebase.storage.UploadTaskSnapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        this.handleProgress(progress);
      }, (err: Error) => {
        this.handleUploadError(err);
      }, () => {  
        this.handleUploadSuccess(uploadTask.snapshot, callback);
      }
    );
  }

  handleUploadStart = () => {
    this.progressToaster = AppToaster.show(this.renderProgress(0));  
  }

  renderProgress = (p: number, success: boolean = true) => {
    const toast: IToastProps = { 
      icon: "cloud-upload",
      message: (
        <div>
          <ProgressBar
            className={classNames({ [Classes.PROGRESS_NO_STRIPES]: p >= 100 })}
            intent={ p < 100 ? Intent.PRIMARY : (success? Intent.SUCCESS : Intent.DANGER)}
            value={ p / 100 }
          />
        </div>
      ),
      timeout: p < 100 ? 0 : 2000,
    }
    return toast;
  }

  handleUploadError = (e: Error) => {
    this.handleUploadEnded(false);
    console.log(e.message);
    AppToaster.show({ intent: Intent.DANGER, message: `File could not be uploaded. The maximum file size is 100 MB.` });
  }

  handleUploadSuccess = async (snapshot: firebase.storage.UploadTaskSnapshot, callback: (url: string) => void) => {
    this.handleUploadEnded(true);
    const fileName = snapshot.metadata.name;
    const songUrl = await snapshot.ref.getDownloadURL()
    callback(songUrl);
    console.log(fileName);    
  }

  handleUploadEnded = (success: boolean) => {
    AppToaster.show(this.renderProgress(100, success), this.progressToaster);
    this.setState({ uploadProgress: 0 }); 
  }

  handleProgress = (p: number) => {
    this.setState({ uploadProgress: p })
    AppToaster.show(this.renderProgress(p), this.progressToaster);
  }

  render() {
    const { item: project } = this.props;
    return (
      <div>
        <ul className="bp3-breadcrumbs">
          <li><Breadcrumb href="/projects" text="Projects" onClick={() => this.props.exitProject()}/></li>
          <li><Breadcrumb href="#" text={project.name} /></li>
        </ul>

        <Tabs id="WorkspaceTabs" onChange={this.handleTabChange} selectedTabId={this.state.tabId}>
          <Tab id="song-list" title={"Song list"} panel={
            <SongListPanel
              updateProject={this.props.updateProject}
              renderFileUploader={this.renderFileUploader}
              title="Songs"
              project={this.state.project}/>
          } />
        </Tabs>
      </div>
    );
  }
}