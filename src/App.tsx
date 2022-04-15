// external
import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { RebaseBinding } from 're-base';
import { Unsubscribe } from 'firebase';
import firebase from 'firebase/app';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Spinner, Intent } from '@blueprintjs/core';
import semver from 'semver';

// internal
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Login } from './components/Login';
import { Logout } from './components/Logout';
import { Workspace } from './components/Workspace';
import { IProject, IAppProps, IAppState, Project, IDictProject, IUserInfo } from './types';
import './style/stylesheet.css';
import { FirebaseInstance } from './base';
import { ProjectList } from './components/ProjectList';
import { AppToaster } from './toaster';
import { APP_VERSION, SUPPORTED_VERSIONS } from './constants';
import { LandingPage } from './components/LandingPage';
import changelogPath from './changelog.md';

// todo: not really typescript, no type safety but couldn't get it to work
// cf: https://stackoverflow.com/questions/47747754/how-to-rewrite-the-protected-router-using-typescript-and-react-router-4-and-5/47754325#47754325
function AuthenticatedRoute({ component: Component, authenticated, ...rest }: any) {
  const routeComponent = (props: any) => (
    authenticated?
      <Component {...props} {...rest} />
      : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
  );
  return <Route {...rest} render={routeComponent} />;
}

// use this when multiple items should open the same component
function AuthenticatedRouteMulti({ component: Component, items, param, ...rest }: any) {
  return (
    <Route  {...rest}
      render={({ match, ...props }) => {
        if (rest.requireAuth && !rest.authenticated) {
          return (
            <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
          );
        }

        // todo: a bit worried about the exclamation mark here... should be fixed
        const item = items[match.params[param]!];
        if (item) {
          return <Component item={item} {...props} match={match} {...rest} />;
        } else {
          return <h1>Component not found</h1>;
        }
      }
      }
    />
  )
}

class App extends Component<IAppProps, IAppState> {
  dataRef: RebaseBinding;
  fb: FirebaseInstance;
  removeAuthListener: Unsubscribe;

  constructor(props: IAppProps) {
    super(props);
    this.state = {
      projects: {},
      loading: true,
      updating: false,
      changelog: "",
      activeProjectId: "",
      currentUser: null,
    };
    this.fb = new FirebaseInstance();
  }

  componentDidMount() {
    this.removeAuthListener = this.fb.app.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          currentUser: user,
        });
        this.fb.base.fetch(`users/${user.uid}`, {
          context: this,
          then: (data: IUserInfo) => {
            if (!data || !data.patchNotification || semver.gt(APP_VERSION, data.patchNotification)) {
              AppToaster.show({ 
                intent: Intent.NONE,
                message: `Since your last visit, the application has been updated to version ${APP_VERSION}. Please check the changelog on the frontpage for more information.`,
                timeout: 10000,
              })
              this.fb.base.update(`users/${user.uid}`, {
                data: { patchNotification: APP_VERSION },
              });
            }
          },
        });
        this.fb.base.fetch(`projects/${user.uid}`, {
          context: this,
          then: (data: IDictProject) => {
            this.setState({
              projects: data,
              loading: false,
            });
          },
        });
      } else {
        this.setState({
          currentUser: null,
          loading: false,
        });
      }

    });
    fetch(changelogPath).then((response) => response.text()).then((text) => {
      this.setState({ changelog: text });
    })
  }

  componentWillUnmount() {
    this.removeAuthListener();
  }

  updateProjectsDatabase = (projects: IDictProject) => {
    this.setState({ projects, updating: true }, () => {
      this.fb.base.update(`projects/${this.state.currentUser!.uid}`, {
        data: this.state.projects,
        then: () => {
          this.setState({
            updating: false,
          });
        },
      });
    });
  }

  addProject = (name: string) => {
    if (!this.state.currentUser) {
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be added: no user signed in" });
    } else if (!this.validProjectName(name)) {
      // todo: save warning messages somewhere
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be added: project name is empty or is not unique" });
    } else {
      let project = new Project(name, this.state.currentUser!.uid);
      
      const projects = { ...this.state.projects };
      projects[project.id] = project.jsonData;

      this.updateProjectsDatabase(projects);
    }
  }

  // todo: merge this method with addProject()
  copyProject = (project: IProject) => {
    const copyname = `${project.name}-copy`
    if (!this.state.currentUser) {
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be copied: no user signed in" });
    } else if (!this.validProjectName(copyname)) {
      console.log(copyname);
      // todo: save warning messages somewhere
      AppToaster.show({ intent: Intent.DANGER, message: "Project could not be copied: project name is not unique" });
    } else {
      let projectClone = _.cloneDeep(project);
      projectClone.id = uuidv4();
      projectClone.name = copyname;

      const projects = { ...this.state.projects };
      projects[projectClone.id] = projectClone;
      this.updateProjectsDatabase(projects);
    }
  }

  validProjectName = (projectName: string, projectId: string = "") => {
    let valid = true;
    if (projectName === "") {
      valid = false;
    } else {
      const projects = { ...this.state.projects }
      for (const id in projects) {
        if (
          id !== projectId
          && !projects[id].deleted
          && SUPPORTED_VERSIONS.includes(projects[id].appVersion!)
          && projects[id].name === projectName
        ) {
          valid = false;
          break;
        }
      }
    }
    return valid;
  }

  exitProject = () => {
    this.setActiveProject("");
  }

  setActiveProject = (activeProjectId: string) => {
    if (!activeProjectId) {
      this.setState({ activeProjectId: "" });
    } else if (this.state.projects[activeProjectId]) {
      this.setState({ activeProjectId });
    } else {
      throw new Error(`Project with id ${activeProjectId} could not be found in the database`)
    }
  }

  updateProject = (iProject: IProject) => {
    console.log(iProject);
    if (!this.validProjectName(iProject.name, iProject.id)) {
      // todo: save warning messages somewhere
      AppToaster.show({ intent: Intent.DANGER, message: `Invalid project name` });
    } else {
      this.setActiveProject(iProject.id);
      const projects = { ...this.state.projects };

      // not implemented
      this.issueDuplicateWarnings(iProject);
      let updatedProject;
      try {
        updatedProject = Project.fromIProject(iProject)
          .updateTimeStamp()  
          .jsonData;

        projects[iProject.id] = updatedProject;
      } catch (e) {
        projects[iProject.id] = iProject;
        if (e instanceof Error) {
          AppToaster.show({ intent: Intent.DANGER, message: `Something is wrong: ${e.message}` });
        }
      }
      this.updateProjectsDatabase(projects);
    }
  }

  // todo: implement
  // shows a toast if there are some entries with the same name in the updated project
  issueDuplicateWarnings = (project: IProject) => {

  }

  // todo: update this to actually remove the project from db
  deleteProject = (id: string) => {
    console.log(id);
    const projects = { ...this.state.projects };
    projects[id].deleted = true;
    this.setState(() => ({
      projects: projects
    }), () => this.updateProjectsDatabase(projects));
  }

  setCurrentUser = (userCred: firebase.auth.UserCredential) => {
    if (userCred) {
      this.setState({
        currentUser: userCred.user,
        loading: false,
      });
    } else {
      this.setState({
        currentUser: null,
        loading: false,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div style={{ textAlign: "center", position: "absolute", top: "25%", left: "50%" }}>
          <h3>Loading</h3>
          <Spinner />
        </div>
      )
    }
    return (
      <div className="app-body">
        <BrowserRouter>
          <div className="app-container">
            <Header
              userData={this.state.currentUser}
              exitProject={this.exitProject}
              activeProject={this.state.activeProjectId? this.state.projects[this.state.activeProjectId] : null}
              authenticated={!!this.fb.app.auth().currentUser} />
            <div className="main-content">
              <div className="workspace-wrapper">
                <Route exact path="/" render={ props => {
                  return <LandingPage changelog={this.state.changelog}/>
                }} />
                <Route exact path="/login" render={ props => {
                  return (
                    <Login authenticated={!!this.fb.app.auth().currentUser} setCurrentUser={this.setCurrentUser} {...props} fb={this.fb} />
                  )
                }} />
                <Route exact path="/logout" render={ props => {
                  return (
                    <Logout fb={this.fb} />
                  )
                }} />
                <AuthenticatedRoute
                  exact={true}
                  path="/projects"
                  authenticated={!!this.fb.app.auth().currentUser}
                  component={ProjectList}
                  projects={this.state.projects}
                  addProject={this.addProject}
                  setActiveProject={this.setActiveProject}
                  updateProject={this.updateProject}
                  copyProject={this.copyProject}
                  deleteProject={this.deleteProject}
                />
                <AuthenticatedRouteMulti
                  path="/projects/:projectId"
                  component={Workspace}
                  authenticated={!!this.fb.app.auth().currentUser}
                  requireAuth={true}
                  param="projectId"
                  items={this.state.projects}
                  exitProject={this.exitProject}
                  updateProject={this.updateProject}
                  currentUser={this.state.currentUser}
                />
              </div>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
