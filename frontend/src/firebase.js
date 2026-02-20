// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyChww4F3HpMl_PuN_DWX8icLOPPWZA455Q",
  authDomain: "vajra-fc776.firebaseapp.com",
  projectId: "vajra-fc776",
  storageBucket: "vajra-fc776.firebasestorage.app",
  messagingSenderId: "394400059534",
  appId: "1:394400059534:web:e3bafe8cf7acc1304179df",
  measurementId: "G-BMQXMRNTW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();