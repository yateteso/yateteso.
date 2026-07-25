import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || undefined);

const newImages = {
  "iPhone 15 Pro Max": "https://images.unsplash.com/photo-1696446701796-da61225697cc?q=80&w=800&auto=format&fit=crop",
  "Samsung Galaxy S24 Ultra": "https://images.unsplash.com/photo-1610945265064-3234dac7de89?q=80&w=800&auto=format&fit=crop",
  "Dell XPS 15": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop",
  "HP Spectre x360": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop",
  "Clear Case for iPhone 15 Pro Max": "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=800&auto=format&fit=crop",
  "Wireless Charging Pad": "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop",
  "Premium Leather Laptop Sleeve": "https://images.unsplash.com/photo-1580974582391-a6649c82a85f?q=80&w=800&auto=format&fit=crop",
  "Ergonomic Wireless Mouse": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop"
};

async function run() {
  const snapshot = await getDocs(collection(db, 'products'));
  const docs = snapshot.docs;
  for (const document of docs) {
    const data = document.data();
    if (newImages[data.name]) {
      console.log('Updating', data.name);
      await updateDoc(doc(db, 'products', document.id), {
        imageUrl: newImages[data.name]
      });
    }
  }
  console.log('Done');
  process.exit(0);
}
run();
