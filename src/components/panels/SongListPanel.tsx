// external
import React, { Component } from 'react';

// internal
import { ISongListPanelProps, ISongListPanelState } from '../../types';
export class SongListPanel extends Component<ISongListPanelProps, ISongListPanelState> {
        
  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        Hello world!
      </div>
    )
  }
}