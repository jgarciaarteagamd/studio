// src/lib/firebase-config.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore"; // Importamos Firestore

// Configuración para el proyecto "endocloud-notes"
const firebaseConfig = {
  apiKey: "AIzaSyC-7cWhzO7AS0smYySv6MG-m8qw95FzzVE", // **¡Importante! Considera usar variables de entorno para esto en producción.**
  authDomain: "endocloud-notes.firebaseapp.com",
  projectId: "endocloud-notes",
  storageBucket: "endocloud-notes.appspot.com", // Corregido al formato .appspot.com
  messagingSenderId: "1017914719571",
  appId: "1:1017914719571:web:2c1ce14415c1d184be35a6",
  // measurementId es opcional y no estaba en tu última configuración, lo omito.
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // Declaramos la variable para Firestore

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app); // Inicializamos Firestore

export { app, auth, db }; // Exportamos 'db' también