// src/lib/firebase-config.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// TODO: Reemplaza esto con tu configuración de Firebase del proyecto
// Estas son claves PÚBLICAS y está bien tenerlas en el lado del cliente.
// Para mayor seguridad en el futuro, puedes moverlas a variables de entorno.
const firebaseConfig = {
  apiKey: "AIzaSyAUp4mLtVBLHLIBv03TX_u8dI7ySmW4XJk", // POR FAVOR, VERIFICA ESTA CLAVE CUIDADOSAMENTE
  authDomain: "medlog-cloud.firebaseapp.com",
  projectId: "medlog-cloud",
  storageBucket: "medlog-cloud.appspot.com", // CORREGIDO
  messagingSenderId: "801327813101",
  appId: "1:801327813101:web:60b2e7f3cabb0cb236d7e4",
  measurementId: "G-44J30MMRQY"
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
