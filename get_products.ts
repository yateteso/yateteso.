import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-yatetesoelectron-fc125f4c-985e-4c99-8ede-f34ce5d967a2');

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data().name, doc.data().imageUrl);
  });
}
run();
