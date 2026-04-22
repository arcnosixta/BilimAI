// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAldxIiXS-M9OWwbUpCVfNjS1tcCgFK-lU",
    authDomain: "bilimai-317e8.firebaseapp.com",
    projectId: "bilimai-317e8",
    storageBucket: "bilimai-317e8.firebasestorage.app",
    messagingSenderId: "809788611994",
    appId: "1:809788611994:web:2bbd71059bd23f382e6e23",
    measurementId: "G-CW6GFVRKV0"
};

// Duplicate app қатесін болдырмау үшін
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Экспорт
export { auth, db, analytics };
export default app;