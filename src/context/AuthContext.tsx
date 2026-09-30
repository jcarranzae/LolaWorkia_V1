'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, BlogPost, GalleryItem, Gallery3DArtwork } from '@/types';
import { INITIAL_USERS } from '@/data/mockUsers';
import { INITIAL_BLOG_POSTS } from '@/data/mockBlog';
import { INITIAL_GALLERY_ITEMS } from '@/data/mockGallery';
import { INITIAL_3D_ARTWORKS } from '@/data/mockGallery3D';
import { auth, db, storage, googleProvider } from '@/lib/firebase';
import { ref as storageRef, listAll as storageListAll, getDownloadURL as storageGetDownloadURL } from 'firebase/storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  usersList: User[];
  blogPosts: BlogPost[];
  galleryItems: GalleryItem[];
  gallery3dArtworks: Gallery3DArtwork[];
  categories: string[];
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  logout: () => Promise<void>;
  register: (name: string, username: string, email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; message?: string }>;
  isAdmin: boolean;
  isMember: boolean;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'likes' | 'commentsCount'>) => Promise<void>;
  updateBlogPost: (id: string, updatedFields: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'likes'>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  addGallery3DArtwork: (artwork: Omit<Gallery3DArtwork, 'id'>) => Promise<void>;
  deleteGallery3DArtwork: (id: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  addCategory: (name: string) => Promise<{ success: boolean; message?: string }>;
  deleteCategory: (name: string) => Promise<{ success: boolean; message?: string }>;
  quickLoginAsMember: () => void;
  quickLoginAsAdmin: () => void;
  isFirebaseActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_CATEGORIES = ['Fotografía & Estilo', 'Exclusivo VIP', 'Tecnología & Setup', 'Viajes & Estilo'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [gallery3dArtworks, setGallery3dArtworks] = useState<Gallery3DArtwork[]>(INITIAL_3D_ARTWORKS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);

  // Helper function to fetch or initialize user profile & role from Firestore
  const fetchOrCreateUserProfile = async (firebaseUser: any): Promise<User> => {
    let role: UserRole = firebaseUser.email?.includes('admin') ? 'admin' : 'member';
    let name = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario';
    const username = firebaseUser.email?.split('@')[0] || 'usuario';

    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.role) role = data.role as UserRole;
        if (data.name) name = data.name;
      } else {
        // First-time login: create Firestore user profile with assigned role
        await setDoc(userRef, {
          name,
          username,
          email: firebaseUser.email || '',
          role,
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (e) {
      console.log('Firestore user doc sync note:', e);
    }

    return {
      id: firebaseUser.uid,
      uid: firebaseUser.uid,
      username,
      name,
      email: firebaseUser.email || '',
      role,
      avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
      subscribedSince: new Date().toISOString().split('T')[0],
      plan: role === 'admin' ? 'Pro Creator' : 'VIP Club',
    };
  };

  // Initialize LocalStorage + Firebase state
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('lola_auth_user') || localStorage.getItem('aura_auth_user');
      const savedUsersList = localStorage.getItem('lola_users_list') || localStorage.getItem('aura_users_list');
      const savedPosts = localStorage.getItem('lola_blog_posts') || localStorage.getItem('aura_blog_posts');
      const savedGallery = localStorage.getItem('lola_gallery_items') || localStorage.getItem('aura_gallery_items');
      const savedGallery3D = localStorage.getItem('lola_gallery3d_artworks');
      const savedCategories = localStorage.getItem('lola_categories') || localStorage.getItem('aura_categories');

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedPosts) {
        try {
          const parsed = JSON.parse(savedPosts) as BlogPost[];
          const mergedWithFreshInitials = parsed.map((p) => {
            const fresh = INITIAL_BLOG_POSTS.find((init) => init.id === p.id || init.slug === p.slug);
            return fresh || p;
          });
          INITIAL_BLOG_POSTS.forEach((init) => {
            if (!mergedWithFreshInitials.some((m) => m.id === init.id || m.slug === init.slug)) {
              mergedWithFreshInitials.push(init);
            }
          });
          setBlogPosts(mergedWithFreshInitials);
        } catch {
          setBlogPosts(INITIAL_BLOG_POSTS);
        }
      } else {
        setBlogPosts(INITIAL_BLOG_POSTS);
      }
      if (savedGallery3D) setGallery3dArtworks(JSON.parse(savedGallery3D));
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        const cleanCats = Array.from(new Set(parsed)).filter((c) => c !== 'Todos') as string[];
        setCategories(cleanCats);
      }
    } catch (e) {
      console.error('LocalStorage load error:', e);
    }

    // Fetch categories from Firestore
    getDoc(doc(db, 'settings', 'categories'))
      .then((catSnap) => {
        if (catSnap.exists() && catSnap.data().list) {
          const list = Array.from(new Set(catSnap.data().list as string[])).filter((c) => c !== 'Todos');
          setCategories(list);
          localStorage.setItem('lola_categories', JSON.stringify(list));
        }
      })
      .catch((err) => console.log('Firestore categories fetch fallback:', err));

    // Real-time Firestore listener for categories
    const unsubCategories = onSnapshot(doc(db, 'settings', 'categories'), (catSnap) => {
      if (catSnap.exists() && catSnap.data().list) {
        const list = Array.from(new Set(catSnap.data().list as string[])).filter((c) => c !== 'Todos');
        setCategories(list);
        localStorage.setItem('lola_categories', JSON.stringify(list));
      }
    }, (err) => console.log('Firestore categories onSnapshot fallback:', err));

    // Real-time Firestore listener for blog posts
    const unsubPosts = onSnapshot(collection(db, 'posts'), (querySnap) => {
      if (!querySnap.empty) {
        const loadedPosts: BlogPost[] = [];
        querySnap.forEach((docSnap) => {
          const data = docSnap.data();
          const id = data.id || docSnap.id;
          loadedPosts.push({ ...data, id } as BlogPost);
        });
        const merged = [...loadedPosts];
        INITIAL_BLOG_POSTS.forEach((initPost) => {
          if (!merged.some((m) => m.id === initPost.id || m.slug === initPost.slug || m.title === initPost.title)) {
            merged.push(initPost);
          }
        });
        setBlogPosts(merged);
        localStorage.setItem('lola_blog_posts', JSON.stringify(merged));
      }
    }, (err) => console.log('Firestore posts onSnapshot fallback:', err));

    // Real-time Firestore listener for 2D gallery items
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (querySnap) => {
      if (!querySnap.empty) {
        const loadedGallery: GalleryItem[] = [];
        querySnap.forEach((docSnap) => {
          const data = docSnap.data();
          const id = data.id || docSnap.id;
          loadedGallery.push({ ...data, id } as GalleryItem);
        });
        const merged = [...loadedGallery];
        INITIAL_GALLERY_ITEMS.forEach((initItem) => {
          if (!merged.some((m) => m.id === initItem.id || m.title === initItem.title)) {
            merged.push(initItem);
          }
        });
        setGalleryItems(merged);
        localStorage.setItem('lola_gallery_items', JSON.stringify(merged));
      }
    }, (err) => console.log('Firestore gallery onSnapshot fallback:', err));

    // Real-time Firestore listener for 3D gallery artworks
    const unsubGallery3D = onSnapshot(collection(db, 'gallery3d'), (querySnap) => {
      if (!querySnap.empty) {
        const loaded3D: Gallery3DArtwork[] = [];
        querySnap.forEach((docSnap) => {
          const data = docSnap.data();
          const id = data.id || docSnap.id;
          loaded3D.push({ ...data, id } as Gallery3DArtwork);
        });
        // Merge with initial default artworks avoiding duplicates so all rooms have works
        const merged = [...loaded3D];
        INITIAL_3D_ARTWORKS.forEach((initArt) => {
          if (!merged.some((m) => m.id === initArt.id || (m.title === initArt.title && m.roomId === initArt.roomId))) {
            merged.push(initArt);
          }
        });
        setGallery3dArtworks(merged);
        localStorage.setItem('lola_gallery3d_artworks', JSON.stringify(merged));
      }
    }, (err) => console.log('Firestore gallery3d onSnapshot fallback:', err));

    // Auto-scan Firebase Storage "gallery_3d/" bucket folder to guarantee all stored images are in the 3D gallery
    const syncStorageGallery3DFolder = async () => {
      try {
        const folderRef = storageRef(storage, 'gallery_3d');
        const listResult = await storageListAll(folderRef);
        if (listResult.items.length > 0) {
          const currentFirestoreSnap = await getDocs(collection(db, 'gallery3d'));
          const existingUrls = new Set<string>();
          currentFirestoreSnap.forEach((d) => {
            const data = d.data();
            if (data.imageUrl) existingUrls.add(data.imageUrl);
          });

          for (const itemRef of listResult.items) {
            const downloadUrl = await storageGetDownloadURL(itemRef);
            const exists = Array.from(existingUrls).some((u) => u.includes(itemRef.name) || u === downloadUrl);
            if (!exists) {
              const cleanTitle = itemRef.name
                .replace(/^\d+_/, '')
                .replace(/\.[^/.]+$/, '')
                .replace(/[-_]/g, ' ')
                .trim();
              const autoTitle = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Obra del Pabellón 3D';
              const newId = `g3d-${Date.now()}-${itemRef.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)}`;
              const newArtwork: Gallery3DArtwork = {
                id: newId,
                title: autoTitle,
                artist: 'Lola Work Studio',
                roomId: 'gran-salon',
                roomName: 'Sala Principal (Gran Salón)',
                imageUrl: downloadUrl,
                medium: 'Modelado 3D & Arte Generativo',
                year: '2026',
                palette: ['#d4af37', '#8a2be2', '#0f172a'],
                analysis: 'Obra sincronizada directamente desde el Bucket de almacenamiento Firebase Storage (/gallery_3d).',
                isExclusive: false,
                createdAt: new Date().toISOString(),
              };
              await setDoc(doc(db, 'gallery3d', newId), newArtwork);
              console.log(`Auto-synchronized Storage item "${itemRef.name}" to 3D Gallery.`);
            }
          }
        }
      } catch (storageErr) {
        console.log('Firebase Storage gallery_3d folder check notice:', storageErr);
      }
    };
    syncStorageGallery3DFolder();

    // Firebase Auth listener with automatic Firestore role lookup
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsFirebaseActive(true);
        const profile = await fetchOrCreateUserProfile(firebaseUser);
        setUser(profile);
        localStorage.setItem('lola_auth_user', JSON.stringify(profile));
      }
    });

    return () => {
      unsubCategories();
      unsubPosts();
      unsubGallery();
      unsubGallery3D();
      unsubscribeAuth();
    };
  }, []);

  // Save changes helper
  const saveState = (
    newUser: User | null,
    newUsersList?: User[],
    newPosts?: BlogPost[],
    newGallery?: GalleryItem[],
    newGallery3D?: Gallery3DArtwork[]
  ) => {
    try {
      if (newUser !== undefined) {
        setUser(newUser);
        if (newUser) localStorage.setItem('lola_auth_user', JSON.stringify(newUser));
        else localStorage.removeItem('lola_auth_user');
      }
      if (newUsersList) {
        setUsersList(newUsersList);
        localStorage.setItem('lola_users_list', JSON.stringify(newUsersList));
      }
      if (newPosts) {
        setBlogPosts(newPosts);
        localStorage.setItem('lola_blog_posts', JSON.stringify(newPosts));
      }
      if (newGallery) {
        setGalleryItems(newGallery);
        localStorage.setItem('lola_gallery_items', JSON.stringify(newGallery));
      }
      if (newGallery3D) {
        setGallery3dArtworks(newGallery3D);
        localStorage.setItem('lola_gallery3d_artworks', JSON.stringify(newGallery3D));
      }
    } catch (e) {
      console.error('Save state error:', e);
    }
  };

  const login = async (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();

    // 1. Try Firebase Authentication if email formatted
    if (cleanUsername.includes('@')) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanUsername, password);
        setIsFirebaseActive(true);
        const fbUser = await fetchOrCreateUserProfile(userCred.user);
        saveState(fbUser);
        return { success: true, role: fbUser.role };
      } catch (err: any) {
        console.log('Firebase auth error:', err.message);
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          return { success: false, message: 'Correo o contraseña incorrectos en Firebase Auth.' };
        }
      }
    }

    // 2. Local Demo Authentication Fallback
    const foundUser = usersList.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
    );

    if (!foundUser) {
      return { success: false, message: 'Usuario no encontrado. Prueba con tu correo registrado o credenciales de acceso.' };
    }

    if (cleanUsername === 'admin' && password !== 'admin123') {
      return { success: false, message: 'Contraseña de admin incorrecta. Usa "admin123".' };
    }

    if (cleanUsername === 'miembro' && password !== 'user123') {
      return { success: false, message: 'Contraseña de miembro incorrecta. Usa "user123".' };
    }

    saveState(foundUser);
    return { success: true, role: foundUser.role };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const userCred = await signInWithPopup(auth, googleProvider);
      const fbUser = await fetchOrCreateUserProfile(userCred.user);
      setIsFirebaseActive(true);

      saveState(fbUser, [...usersList.filter((u) => u.id !== fbUser.id), fbUser]);
      return { success: true, role: fbUser.role };
    } catch (err: any) {
      console.error('Firebase Google login error:', err);
      let msg = 'Error al iniciar sesión con Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Se cerró la ventana emergente de inicio de sesión con Google.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Solicitud de ventana emergente cancelada.';
      } else if (err.message) {
        msg = err.message;
      }
      return { success: false, message: msg };
    };
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.log('Firebase logout:', e);
    }
    saveState(null);
  };

  const quickLoginAsMember = () => {
    const memberAccount = usersList.find((u) => u.role === 'member') || INITIAL_USERS[0];
    saveState(memberAccount);
  };

  const quickLoginAsAdmin = () => {
    const adminAccount = usersList.find((u) => u.role === 'admin') || INITIAL_USERS[1];
    saveState(adminAccount);
  };

  const register = async (name: string, username: string, email: string, password?: string, role: UserRole = 'member') => {
    // 1. Try Firebase Auth registration if password provided
    if (password && password.length >= 6) {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const newUser: User = {
          id: userCred.user.uid,
          name,
          username,
          email,
          role,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          subscribedSince: new Date().toISOString().split('T')[0],
          plan: role === 'admin' ? 'Pro Creator' : 'VIP Club',
        };
        setIsFirebaseActive(true);
        saveState(newUser, [...usersList, newUser]);
        return { success: true };
      } catch (err: any) {
        console.log('Firebase Register fallback:', err.message);
      }
    }

    // 2. Local Demo Registration
    const existing = usersList.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'El nombre de usuario o correo ya está registrado.' };
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      username,
      email,
      role,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      subscribedSince: new Date().toISOString().split('T')[0],
      plan: role === 'admin' ? 'Pro Creator' : 'VIP Club',
    };

    const updatedList = [...usersList, newUser];
    saveState(newUser, updatedList);
    return { success: true };
  };

  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'likes' | 'commentsCount'>) => {
    const newId = `post-${Date.now()}`;
    const newPost: BlogPost = {
      ...postData,
      id: newId,
      likes: 0,
      commentsCount: 0,
    };

    // Firebase Firestore sync attempt
    try {
      await setDoc(doc(db, 'posts', newId), newPost);
      setIsFirebaseActive(true);
    } catch (e) {
      console.log('Firestore setDoc offline fallback:', e);
    }

    const updated = [newPost, ...blogPosts];
    saveState(user, undefined, updated);
  };

  const updateBlogPost = async (id: string, updatedFields: Partial<BlogPost>) => {
    try {
      await setDoc(doc(db, 'posts', id), updatedFields, { merge: true });
      setIsFirebaseActive(true);
    } catch (e) {
      console.log('Firestore setDoc update post fallback:', e);
    }

    const updated = blogPosts.map((post) => (post.id === id ? { ...post, ...updatedFields } : post));
    saveState(user, undefined, updated);
  };

  const deleteBlogPost = async (id: string) => {
    if (!id) return;

    // 1. Direct Firestore deletion
    try {
      await deleteDoc(doc(db, 'posts', id));
    } catch (e) {
      console.log('Firestore deleteDoc fallback:', e);
    }

    // 2. Query cleanup in Firestore if document ID differs from post.id or matches slug
    try {
      const snap = await getDocs(collection(db, 'posts'));
      for (const d of snap.docs) {
        const data = d.data();
        if (d.id === id || data.id === id || (data.slug && data.slug === id)) {
          await deleteDoc(doc(db, 'posts', d.id));
        }
      }
    } catch (e) {
      console.log('Firestore deleteDoc search cleanup note:', e);
    }

    // 3. Immediate state and LocalStorage purge
    const updated = blogPosts.filter((p) => p.id !== id && p.slug !== id);
    saveState(user, undefined, updated);
  };

  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id' | 'likes'>) => {
    const newId = `gal-${Date.now()}`;
    const newItem: GalleryItem = {
      ...itemData,
      id: newId,
      likes: 0,
    };

    try {
      await setDoc(doc(db, 'gallery', newId), newItem);
      setIsFirebaseActive(true);
    } catch (e) {
      console.log('Firestore setDoc gallery fallback:', e);
    }

    const updated = [newItem, ...galleryItems];
    saveState(user, undefined, undefined, updated);
  };

  const deleteGalleryItem = async (id: string) => {
    if (!id) return;

    try {
      await deleteDoc(doc(db, 'gallery', id));
    } catch (e) {
      console.log('Firestore delete gallery fallback:', e);
    }

    try {
      const snap = await getDocs(collection(db, 'gallery'));
      for (const d of snap.docs) {
        const data = d.data();
        if (d.id === id || data.id === id) {
          await deleteDoc(doc(db, 'gallery', d.id));
        }
      }
    } catch (e) {
      console.log('Firestore delete gallery cleanup note:', e);
    }

    const updated = galleryItems.filter((g) => g.id !== id);
    saveState(user, undefined, undefined, updated);
  };

  const addGallery3DArtwork = async (itemData: Omit<Gallery3DArtwork, 'id'>) => {
    const newId = `g3d-${Date.now()}`;
    const newItem: Gallery3DArtwork = {
      ...itemData,
      id: newId,
      createdAt: itemData.createdAt || new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'gallery3d', newId), newItem);
      setIsFirebaseActive(true);
    } catch (e) {
      console.log('Firestore setDoc gallery3d fallback:', e);
    }

    const updated = [newItem, ...gallery3dArtworks];
    saveState(user, undefined, undefined, undefined, updated);
  };

  const deleteGallery3DArtwork = async (id: string) => {
    if (!id) return;

    try {
      await deleteDoc(doc(db, 'gallery3d', id));
    } catch (e) {
      console.log('Firestore delete gallery3d fallback:', e);
    }

    try {
      const snap = await getDocs(collection(db, 'gallery3d'));
      for (const d of snap.docs) {
        const data = d.data();
        if (d.id === id || data.id === id) {
          await deleteDoc(doc(db, 'gallery3d', d.id));
        }
      }
    } catch (e) {
      console.log('Firestore delete gallery3d cleanup note:', e);
    }

    const updated = gallery3dArtworks.filter((g) => g.id !== id);
    saveState(user, undefined, undefined, undefined, updated);
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    const currentUserUpdated = user?.id === userId ? { ...user, role: newRole } : user;

    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
    } catch (e) {
      console.log('Firestore user role update fallback:', e);
    }

    saveState(currentUserUpdated, updated);
  };

  const addCategory = async (categoryName: string): Promise<{ success: boolean; message?: string }> => {
    const clean = categoryName.trim();
    if (!clean) return { success: false, message: 'El nombre de la categoría no puede estar vacío.' };
    if (categories.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      return { success: false, message: 'La categoría ya existe.' };
    }
    const updated = [...categories, clean];
    setCategories(updated);
    localStorage.setItem('lola_categories', JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'settings', 'categories'), { list: updated });
      setIsFirebaseActive(true);
    } catch (e) {
      console.log('Firestore setDoc categories fallback:', e);
    }

    return { success: true };
  };

  const deleteCategory = async (categoryName: string): Promise<{ success: boolean; message?: string }> => {
    const updated = categories.filter((c) => c !== categoryName);
    setCategories(updated);
    localStorage.setItem('lola_categories', JSON.stringify(updated));

    try {
      await setDoc(doc(db, 'settings', 'categories'), { list: updated });
    } catch (e) {
      console.log('Firestore delete categories fallback:', e);
    }

    return { success: true };
  };

  const isAdmin = user?.role === 'admin';
  const isMember = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        blogPosts,
        galleryItems,
        gallery3dArtworks,
        categories,
        login,
        loginWithGoogle,
        logout,
        register,
        isAdmin,
        isMember,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addGalleryItem,
        deleteGalleryItem,
        addGallery3DArtwork,
        deleteGallery3DArtwork,
        updateUserRole,
        addCategory,
        deleteCategory,
        quickLoginAsMember,
        quickLoginAsAdmin,
        isFirebaseActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
