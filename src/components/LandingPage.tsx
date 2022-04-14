// external
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown'
import { Collapse, Button, Card } from "@blueprintjs/core";

// internal
import { ILandingPageProps, ILandingPageState } from '../types';

export class LandingPage extends Component<ILandingPageProps, ILandingPageState> {
  constructor(props: ILandingPageProps) {
    super(props);
    this.state = {
      changelogOpen: false,
    }
  }

  handleExpandChangelogClick = (e: React.MouseEvent<HTMLElement>) => {
    let newState = { ...this.state };
    newState.changelogOpen = !newState.changelogOpen;
    this.setState(newState);
  }

  render() {
    return (
      <div>
        <Card key={`info-card`} id={`info-card`} elevation={0} className="panel-card bp3-elevation-0">
          <h1>bandaid</h1>
          <p>Manage your band's songs, shows, rehearsals and more!</p>
        </Card>
        <Card key={`changelog-card`} id={`changelog-card`} elevation={this.state.changelogOpen ? 2 : 0} className="panel-card bp3-elevation-0 bp3-interactive">
          <div className="panel-card-header" onClick={(e: React.MouseEvent<HTMLElement>) => this.handleExpandChangelogClick(e)}>
            <h3 style={{ flexGrow: 1 }}>Changelog</h3>
            <Button minimal className="bp3-button" icon={this.state.changelogOpen ? "arrow-up" : "arrow-down"}/>
          </div>
          <Collapse key={`changelog-collapse`} isOpen={this.state.changelogOpen}>
            <ReactMarkdown children={this.props.changelog}/>
          </Collapse>
        </Card>
      </div>
    )
  }

}