// src/lib/firebase-config.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Configuración para el proyecto "endocloud-notes"
const firebaseConfig = {
  apiKey: "AIzaSyC-7cWhzO7AS0smYySv6MG-m8qw95FzzVE",
  authDomain: "endocloud-notes.firebaseapp.com",
  projectId: "endocloud-notes",
  storageBucket: "endocloud-notes.appspot.com", // Corregido al formato .appspot.com
  messagingSenderId: "1017914719571",
  appId: "1:1017914719571:web:2c1ce14415c1d184be35a6",
  // measurementId es opcional y no estaba en tu última configuración, lo omito.
};

let app: FirebaseApp;
let auth: Auth;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);

export { app, auth };
