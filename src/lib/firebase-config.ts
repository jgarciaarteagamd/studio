// src/lib/firebase-config.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// TODO: Reemplaza esto con tu configuración de Firebase del proyecto
// Estas son claves PÚBLICAS y está bien tenerlas en el lado del cliente.
// Para mayor seguridad en el futuro, puedes moverlas a variables de entorno.
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI", // Reemplaza con tu apiKey
  authDomain: "TU_PROYECTO_ID.firebaseapp.com", // Reemplaza con tu authDomain
  projectId: "TU_PROYECTO_ID", // Reemplaza con tu projectId
  storageBucket: "TU_PROYECTO_ID.appspot.com", // Reemplaza con tu storageBucket
  messagingSenderId: "TU_MESSAGING_SENDER_ID", // Reemplaza con tu messagingSenderId
  appId: "TU_APP_ID", // Reemplaza con tu appId
  // measurementId: "G-TU_MEASUREMENT_ID" // Opcional, si usas Analytics
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
