import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXSy94BxVsUK_fa6kce-nE7D6M2sylQCM",
  authDomain: "voltaaestante.firebaseapp.com",
  projectId: "voltaaestante",
  storageBucket: "voltaaestante.firebasestorage.app",
  messagingSenderId: "330845862353",
  appId: "1:330845862353:web:f937f589ab14fe6f9dc8f0",
  measurementId: "G-15SHL658CD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export {db, app, analytics};