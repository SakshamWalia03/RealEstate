import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: "realestate-a1548.firebaseapp.com",
  projectId: "realestate-a1548",
  storageBucket: "realestate-a1548.appspot.com",
  messagingSenderId: "207996879483",
  appId: "1:207996879483:web:de75d536ebb3816b1f58de"
};

const app = initializeApp(firebaseConfig);
export default app;