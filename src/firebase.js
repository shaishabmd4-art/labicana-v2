import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBlm8q8YHV0L-LMJyBl3S1d6x4sgn-aNa8',
  authDomain: 'labicana-ce02f.firebaseapp.com',
  projectId: 'labicana-ce02f',
  storageBucket: 'labicana-ce02f.firebasestorage.app',
  messagingSenderId: '1078482645531',
  appId: '1:1078482645531:web:1d45200789637cde0d3ebe',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
