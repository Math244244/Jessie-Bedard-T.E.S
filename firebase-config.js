// =============================================
// Configuration Firebase — Jessie Bédard, T.E.S.
// =============================================
//
// INSTRUCTIONS DE CONFIGURATION :
// 1. Allez sur https://console.firebase.google.com
// 2. Sélectionnez le projet "jessie-tes"
// 3. Activez Firestore : Build > Firestore Database > Create database > Production mode
// 4. Activez Auth : Build > Authentication > Get started > Email/Password > Enable
// 5. Créez un compte admin : Authentication > Users > Add user
// 6. Récupérez la config : Project Settings (engrenage) > General > Your apps > Web app
//    Si aucune app web : "Add app" > Web > Enregistrer > Copier firebaseConfig
// 7. Remplacez les valeurs ci-dessous par celles de votre projet
// 8. Déployez : firebase deploy
//

const firebaseConfig = {
    apiKey: "AIzaSyCP6CF2tAlAtxZVt3TRANK4jZ_5z6bP5z0",
    authDomain: "jessie-tes.firebaseapp.com",
    projectId: "jessie-tes",
    storageBucket: "jessie-tes.firebasestorage.app",
    messagingSenderId: "59395449881",
    appId: "1:59395449881:web:03cbe0b6b210b28746f688",
    measurementId: "G-WF8XNMFQXV"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore ? firebase.firestore() : null;
const auth = firebase.auth ? firebase.auth() : null;
