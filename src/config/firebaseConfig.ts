import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const emulatorProjectId = "demo-project";

export const firebaseConfig = {
  apiKey: emulatorProjectId,
  authDomain: emulatorProjectId,
  projectId: emulatorProjectId,
  storageBucket: emulatorProjectId,
  messagingSenderId: emulatorProjectId,
  appId: emulatorProjectId,
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);
