// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-eab32.firebaseapp.com",
  projectId: "mern-estate-eab32",
  storageBucket: "mern-estate-eab32.appspot.com",
  messagingSenderId: "203733185710",
  appId: "1:203733185710:web:b16de4f056aa791506e93f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);