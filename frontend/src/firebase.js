import { initializeApp } from "firebase/app";
import 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAn4X1Eut8Nri6MUmOguo8tiKM_rGnVPu8",
    authDomain: "suvidha-otp.firebaseapp.com",
    projectId: "suvidha-otp",
    storageBucket: "suvidha-otp.firebasestorage.app",
    messagingSenderId: "128158601168",
    appId: "1:128158601168:web:c15f4cc1175cb4ca18b3d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;