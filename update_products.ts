import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));
  const docs = snapshot.docs;
  for (const document of docs) {
    const data = document.data();
    console.log(data.name, '=>', data.imageUrl);
  }
}
run();
