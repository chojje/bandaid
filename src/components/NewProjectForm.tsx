// external
import React, { Component } from 'react'

//internal
import { INewProjectFormProps, INewProjectFormState } from '../types'

export class NewProjectForm extends Component<INewProjectFormProps, INewProjectFormState> {

  projectForm: HTMLFormElement;
  nameInput: HTMLInputElement;

  constructor(props: INewProjectFormProps) {
    super(props);
    this.state = {
      uploading: false,
    };
  }

  createProject = (event: React.FormEvent) => {
    event.preventDefault();

    const name = this.nameInput.value;
    this.props.addProject(name);

    this.projectForm.reset();
    this.props.postSubmitHandler();
  }

  render() {
    return (
      <div className="new-project-div">
        <form className="new-project-form" onSubmit={(event) => this.createProject(event)} ref={(form) => this.projectForm = form!}>
          <label className="bp3-label">
            Project name
            <input className="bp3-input" name="name" type="text" ref={(input) => { this.nameInput = input! }} placeholder="Project name"></input>
          </label>
        </form>
      </div>
    )
  }
}