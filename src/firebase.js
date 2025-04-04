import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app;
let db;
let auth;

async function getFirebaseConfig() {
  try {
    const response = await fetch("https://learnifya1-d7a809b39e9d.herokuapp.com/api/firebase-config"); // Fetch config from Flask
    return await response.json();
  } catch (error) {
    console.error("Error fetching Firebase config:", error);
    return null;
  }
}

// ✅ Function to initialize Firebase dynamically
export async function initFirebase() {
  if (!app) {
    const firebaseConfig = await getFirebaseConfig();
    if (firebaseConfig) {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    }
  }
  return { app, db, auth };
}
