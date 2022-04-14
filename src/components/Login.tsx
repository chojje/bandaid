import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Intent } from '@blueprintjs/core';
import { AppToaster } from '../toaster';
import { ILoginProps, ILoginState } from '../types';

const loginStyles = {
  width: "90%",
  maxWidth: "315px",
  margin: "20px auto",
  border: "1px solid #ddd",
  borderRadius: "5px",
  padding: "10px",
}

export class Login extends Component<ILoginProps, ILoginState> {
  emailInput: HTMLInputElement;
  passwordInput: HTMLInputElement;
  loginForm: HTMLFormElement;

  constructor(props: ILoginProps) {
    super(props);
    this.state = {
      redirect: this.props.authenticated,
    }
  }

  authWithGoogle = () => {
    this.props.fb.signInWithGooglePopup()
      .then((user: firebase.auth.UserCredential) => {
        this.props.setCurrentUser(user);
        this.setState({ redirect: true });
      })
      .catch(error => {
        //todo: should this toast propagate to App?
        AppToaster.show({ intent: Intent.DANGER, message: `${error}, unable to sign in with Google` });
      });
  }

  render() {
    const { from } = this.props.location.state || { from: { pathname: '/projects' } }
    if (this.state.redirect) {
      return <Redirect to={from} />
    }

    return (
      <div style={loginStyles}>
        <button style={{ width: "100%" }} className="pt-button pt-intent-primary" onClick={() => { this.authWithGoogle() }}>Login with Google</button>
        <hr style={{ marginTop: "10px", marginBottom: "10px" }} />
      </div>
    )
  }
}