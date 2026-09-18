import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import app, { auth, db, storage, googleProvider } from './lib/firebase';
import { INITIAL_BLOG_POSTS } from './data/mockBlog';
import { INITIAL_GALLERY_ITEMS } from './data/mockGallery';
import { INITIAL_PRESET_PRODUCTS } from './data/mockPresets';

export { app, auth, db, storage, googleProvider };

export const testConnection = async () => {
  try {
    await getDoc(doc(db, '_internal_', 'connection_test'));
    console.log("Firestore Connection Test: OK");

    // Auto-seed Firestore collections from imported apps if empty
    seedFirestoreIfEmpty();
  } catch (error) {
    console.log("Firestore Connection Test note:", error);
  }
};

export const seedFirestoreIfEmpty = async () => {
  try {
    // 1. Seed Categories
    const catDocRef = doc(db, 'settings', 'categories');
    const catSnap = await getDoc(catDocRef);
    if (!catSnap.exists()) {
      await setDoc(catDocRef, {
        list: ['Fotografía & Estilo', 'Exclusivo VIP', 'Tecnología & Setup', 'Arte & IA', 'Cultura']
      });
      console.log('Seeded categories to Firestore');
    }

    // 2. Seed Posts
    const postsSnap = await getDocs(collection(db, 'posts'));
    if (postsSnap.empty) {
      for (const post of INITIAL_BLOG_POSTS) {
        await setDoc(doc(db, 'posts', post.id), post);
      }
      console.log('Seeded blog posts to Firestore');
    }

    // 3. Seed Gallery
    const gallerySnap = await getDocs(collection(db, 'gallery'));
    if (gallerySnap.empty) {
      for (const item of INITIAL_GALLERY_ITEMS) {
        await setDoc(doc(db, 'gallery', item.id), item);
      }
      console.log('Seeded gallery items to Firestore');
    }

    // 4. Seed Presets
    const presetsSnap = await getDocs(collection(db, 'presets'));
    if (presetsSnap.empty) {
      for (const preset of INITIAL_PRESET_PRODUCTS) {
        await setDoc(doc(db, 'presets', preset.id), preset);
      }
      console.log('Seeded preset products to Firestore');
    }
  } catch (err) {
    console.log('Firestore auto-seed notice:', err);
  }
};

export const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    console.error("Error signing in", error);
    if (error?.code === 'auth/unauthorized-domain') {
       alert("Error de autorización: Debes autorizar el dominio de esta aplicación en tu Consola de Firebase -> Authentication -> Settings -> Authorized domains.");
    } else {
       alert("Error al iniciar sesión: " + (error?.message || "Error desconocido"));
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

