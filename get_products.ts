import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().name, doc.data().imageUrl);
  });
}
run();
