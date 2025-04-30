// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYaZVDUEtlKXdr-OMy3emmfrjF8H1Rg8I",
  authDomain: "amoria-1e894.firebaseapp.com",
  projectId: "amoria-1e894",
  storageBucket: "amoria-1e894.firebasestorage.app",
  messagingSenderId: "489119588620",
  appId: "1:489119588620:web:6d3602a844498970172929",
  measurementId: "G-X7F8HVQJ36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };