// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9Qp6lhEx0Nd_pgoUH_xhC4bdRrNB7sQM",
  authDomain: "tasklance-579d3.firebaseapp.com",
  projectId: "tasklance-579d3",
  storageBucket: "tasklance-579d3.firebasestorage.app",
  messagingSenderId: "848710174872",
  appId: "1:848710174872:web:efa883ec3ea4bd7037e8ed",
  measurementId: "G-17FDK7DWLC"
};

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
