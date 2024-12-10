import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js"; 
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js"; 

const firebaseConfig = {
    apiKey: "AIzaSyDbREPWwiC8EKsnd6yafF3hOHciZoT2X5Y",
    authDomain: "khkt-e5f55.firebaseapp.com",
    projectId: "khkt-e5f55",
    storageBucket: "khkt-e5f55.appspot.com",
    messagingSenderId: "362456283753",
    appId: "1:362456283753:web:891b25d6ad8525e6d540f8",
    measurementId: "G-7LMPVMPP4R",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, collection, addDoc, getDocs, deleteDoc, doc, auth }; 
