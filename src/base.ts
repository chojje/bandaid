import Rebase from 're-base';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

export class FirebaseInstance {
  public app: firebase.app.App;
  public auth: firebase.auth.Auth;
  public googleProvider: firebase.auth.GoogleAuthProvider;
  public base: Rebase.Rebase;

  constructor() {    
    //https://stackoverflow.com/questions/43331011/firebase-app-named-default-already-exists-app-duplicate-app
    this.app = firebase.apps.length? firebase.apps[0]: firebase.initializeApp(firebaseConfig);
    
    this.auth = firebase.auth(this.app);
    this.googleProvider = new firebase.auth.GoogleAuthProvider();
    this.base = Rebase.createClass(this.app.database());
  }

  public signInWithGooglePopup(): Promise<firebase.auth.UserCredential> {
    return this.auth.signInWithPopup(this.googleProvider);
  }
}

