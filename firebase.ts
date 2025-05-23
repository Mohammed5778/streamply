
// It's important to use the firebase v8 syntax if your script tags load v8
// For firebase v9+, the import style is different: import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth"; // v9 example

// Assuming global 'firebase' is available from the script tag in index.html (Firebase v8 SDK)
declare global {
  interface Window { firebase: any; }
}

const firebaseConfig = {
  apiKey: "AIzaSyDBpYxSx0MYQ6c_RRSOLvqEEWkKOMq5Zg0", // Replace with your actual API key if needed, or ensure it's configured elsewhere
  authDomain: "sign-b2acd.firebaseapp.com",
  projectId: "sign-b2acd",
  storageBucket: "sign-b2acd.appspot.com",
  messagingSenderId: "1039449385751",
  appId: "1:1039449385751:web:e63d9b04d5698595922552"
};

let db: any; // Using 'any' for Firebase v8 firestore instance type
let auth: any; // Using 'any' for Firebase v8 auth instance type
let storage: any; // Using 'any' for Firebase v8 storage instance type

export const initializeFirebase = (): void => {
  if (!window.firebase.apps.length) {
    window.firebase.initializeApp(firebaseConfig);
  }
  db = window.firebase.firestore();
  auth = window.firebase.auth();
  storage = window.firebase.storage(); // Initialize Firebase Storage
};

export { db, auth, storage };

// Auth helper functions
export const signInWithGoogle = () => {
  const provider = new window.firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};

export const signOut = () => {
  return auth.signOut();
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return auth.onAuthStateChanged(callback);
};

export const signUpWithEmailPassword = (email: string, password: string) => {
  return auth.createUserWithEmailAndPassword(email, password);
};

export const signInWithEmailPassword = (email: string, password: string) => {
  return auth.signInWithEmailAndPassword(email, password);
};

// Storage helper function
export const uploadFileToStorage = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = storage.ref(path);
    const uploadTask = storageRef.put(file);

    uploadTask.on(
      'state_changed',
      (snapshot: any) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      },
      (error: any) => {
        console.error('Upload failed:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(downloadURL);
        } catch (error) {
          console.error('Failed to get download URL:', error);
          reject(error);
        }
      }
    );
  });
};


// Helper to convert Firestore timestamp to string, or handle if it's already a suitable string/number
export const formatFirestoreTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Date unknown';
    if (timestamp.toDate) { // Firestore Timestamp object
        return timestamp.toDate().toLocaleDateString();
    }
    if (typeof timestamp === 'string') return timestamp; // Already a string
    if (typeof timestamp === 'number') return new Date(timestamp).toLocaleDateString(); // Milliseconds
    return 'Date unknown';
};

export const formatViews = (views: number | string | undefined): string => {
    if (views === undefined || views === null) return 'N/A';
    const numViews = Number(views);
    if (isNaN(numViews)) return String(views); // If it's already formatted like "200k"

    if (numViews >= 1000000) {
        return (numViews / 1000000).toFixed(1) + 'M';
    }
    if (numViews >= 1000) {
        return (numViews / 1000).toFixed(1) + 'K';
    }
    return numViews.toLocaleString();
};

export const getVideoDurationFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = Math.floor(videoElement.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
      resolve(`${minutes}:${seconds}`);
    };
    videoElement.onerror = (error) => {
        console.error("Error loading video metadata:", error);
        reject("Could not get video duration.");
    }
    videoElement.src = URL.createObjectURL(file);
  });
};