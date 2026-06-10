import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase is actually configured or is using placeholder values
const isRealFirebaseConfigured = 
  config.apiKey && 
  config.apiKey !== 'placeholder_api_key' && 
  config.apiKey.trim() !== '';

let app, auth, db, googleProvider;
let isMock = false;

if (isRealFirebaseConfigured) {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    console.log('🔥 Firebase initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize Firebase, falling back to mock mode:', error);
    isMock = true;
  }
} else {
  console.log('⚡ Using Mock Local Storage Mode. Set Firebase keys in .env to connect to the cloud.');
  isMock = true;
}

// ==========================================
// MOCK IMPLEMENTATION (Local Storage Fallback)
// ==========================================

const MOCK_STORAGE_KEYS = {
  USER: 'portfolio_mock_user',
  COMMENTS: 'portfolio_mock_comments',
  LIKES: 'portfolio_mock_likes'
};

// Listeners array for mock realtime updates
const mockListeners = {
  auth: [],
  comments: {},
  likes: {}
};

// Helper: Get data from local storage
const getStorageItem = (key, defaultValue) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

// Helper: Set data to local storage
const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize mock database values if empty
if (isMock) {
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.COMMENTS)) {
    // Add some initial mock comments to make the site look alive
    setStorageItem(MOCK_STORAGE_KEYS.COMMENTS, [
      {
        id: 'mock-c1',
        itemId: 'water-puzzle',
        userId: 'mock-u-alice',
        displayName: '愛麗絲同學',
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice',
        rating: 5,
        content: '接水拼圖太好玩了吧！JavaScript 寫得非常有邏輯，加油！',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
      },
      {
        id: 'mock-c2',
        itemId: 'minesweeper',
        userId: 'mock-u-bob',
        displayName: '鮑勃學長',
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bob',
        rating: 4,
        content: '踩地雷設計得非常經典，UI 視覺效果做得很棒！',
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      }
    ]);
  }
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.LIKES)) {
    setStorageItem(MOCK_STORAGE_KEYS.LIKES, [
      { id: 'mock-l1', userId: 'mock-u-alice', itemId: 'water-puzzle' },
      { id: 'mock-l2', userId: 'mock-u-bob', itemId: 'minesweeper' },
      { id: 'mock-l3', userId: 'mock-u-alice', itemId: 'minesweeper' }
    ]);
  }
}

// Mock Auth Operations
const mockAuth = {
  currentUser: getStorageItem(MOCK_STORAGE_KEYS.USER, null),
  signInWithGoogle: () => {
    // Generate a beautiful mock user using DiceBear avatars
    const names = ['極光開發者', '南臺小蜜蜂', '資工代碼人', '前端觀察家', '網頁愛好者'];
    const randomName = names[Math.floor(Math.random() * names.length)] + '#' + Math.floor(1000 + Math.random() * 9000);
    const seed = randomName.replace('#', '');
    const user = {
      uid: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      displayName: randomName,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`,
      email: 'guest@stust.edu.tw'
    };
    mockAuth.currentUser = user;
    setStorageItem(MOCK_STORAGE_KEYS.USER, user);
    mockListeners.auth.forEach(cb => cb(user));
    return Promise.resolve({ user });
  },
  signOut: () => {
    mockAuth.currentUser = null;
    localStorage.removeItem(MOCK_STORAGE_KEYS.USER);
    mockListeners.auth.forEach(cb => cb(null));
    return Promise.resolve();
  },
  onAuthStateChanged: (callback) => {
    mockListeners.auth.push(callback);
    // Trigger immediately with current value
    callback(mockAuth.currentUser);
    return () => {
      mockListeners.auth = mockListeners.auth.filter(cb => cb !== callback);
    };
  }
};

// ==========================================
// EXPOSED UNIFIED INTERFACE
// ==========================================

export { isMock };

// 1. Authentication
export const loginWithGoogle = async () => {
  if (!isMock) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Save/Update user profile in Firestore
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date()
      }, { merge: true });
      return user;
    } catch (error) {
      console.error('Firebase Auth Error:', error);
      throw error;
    }
  } else {
    return mockAuth.signInWithGoogle();
  }
};

export const logout = async () => {
  if (!isMock) {
    return signOut(auth);
  } else {
    return mockAuth.signOut();
  }
};

export const subscribeAuth = (callback) => {
  if (!isMock) {
    return onAuthStateChanged(auth, callback);
  } else {
    return mockAuth.onAuthStateChanged(callback);
  }
};

// 2. Comments Operations
export const subscribeComments = (itemId, callback) => {
  if (!isMock) {
    const q = query(
      collection(db, 'comments'),
      where('itemId', '==', itemId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const commentsList = [];
      snapshot.forEach((doc) => {
        commentsList.push({ id: doc.id, ...doc.data() });
      });
      callback(commentsList);
    }, (error) => {
      console.error('Firestore comments subscription error:', error);
    });
  } else {
    if (!mockListeners.comments[itemId]) {
      mockListeners.comments[itemId] = [];
    }
    mockListeners.comments[itemId].push(callback);

    // Trigger initial load
    const allComments = getStorageItem(MOCK_STORAGE_KEYS.COMMENTS, []);
    const filtered = allComments
      .filter(c => c.itemId === itemId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    callback(filtered);

    // Return unsubscribe function
    return () => {
      mockListeners.comments[itemId] = mockListeners.comments[itemId].filter(cb => cb !== callback);
    };
  }
};

export const addComment = async (itemId, user, rating, content) => {
  const commentData = {
    itemId,
    userId: user.uid || user.userId,
    displayName: user.displayName,
    photoURL: user.photoURL,
    rating: Number(rating),
    content,
    createdAt: new Date().toISOString()
  };

  if (!isMock) {
    return addDoc(collection(db, 'comments'), commentData);
  } else {
    const allComments = getStorageItem(MOCK_STORAGE_KEYS.COMMENTS, []);
    const newComment = {
      id: 'mock-comment-' + Date.now(),
      ...commentData
    };
    allComments.unshift(newComment);
    setStorageItem(MOCK_STORAGE_KEYS.COMMENTS, allComments);

    // Trigger listeners
    if (mockListeners.comments[itemId]) {
      const filtered = allComments
        .filter(c => c.itemId === itemId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      mockListeners.comments[itemId].forEach(cb => cb(filtered));
    }
    return Promise.resolve(newComment);
  }
};

// 3. Likes Operations
export const subscribeLikes = (itemId, currentUserId, callback) => {
  if (!isMock) {
    const q = query(
      collection(db, 'likes'),
      where('itemId', '==', itemId)
    );
    return onSnapshot(q, (snapshot) => {
      let totalLikes = 0;
      let userHasLiked = false;
      snapshot.forEach((doc) => {
        totalLikes++;
        if (currentUserId && doc.data().userId === currentUserId) {
          userHasLiked = true;
        }
      });
      callback({ totalLikes, userHasLiked });
    }, (error) => {
      console.error('Firestore likes subscription error:', error);
    });
  } else {
    if (!mockListeners.likes[itemId]) {
      mockListeners.likes[itemId] = [];
    }
    mockListeners.likes[itemId].push(callback);

    // Helper to compile and trigger callback
    const updateLikes = () => {
      const allLikes = getStorageItem(MOCK_STORAGE_KEYS.LIKES, []);
      const filtered = allLikes.filter(l => l.itemId === itemId);
      const userHasLiked = currentUserId ? filtered.some(l => l.userId === currentUserId) : false;
      callback({ totalLikes: filtered.length, userHasLiked });
    };

    updateLikes();

    return () => {
      mockListeners.likes[itemId] = mockListeners.likes[itemId].filter(cb => cb !== callback);
    };
  }
};

export const toggleLike = async (itemId, currentUserId) => {
  if (!currentUserId) throw new Error('User must be logged in to like');

  if (!isMock) {
    const likeId = `${currentUserId}_${itemId}`;
    const likeRef = doc(db, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      return false; // un-liked
    } else {
      await setDoc(likeRef, {
        userId: currentUserId,
        itemId,
        createdAt: new Date()
      });
      return true; // liked
    }
  } else {
    const allLikes = getStorageItem(MOCK_STORAGE_KEYS.LIKES, []);
    const index = allLikes.findIndex(l => l.userId === currentUserId && l.itemId === itemId);
    let liked = false;

    if (index > -1) {
      allLikes.splice(index, 1);
    } else {
      allLikes.push({
        id: 'mock-like-' + Date.now(),
        userId: currentUserId,
        itemId
      });
      liked = true;
    }

    setStorageItem(MOCK_STORAGE_KEYS.LIKES, allLikes);

    // Trigger likes listeners for this item
    // Since listeners depend on currentUserId, we re-trigger all of them.
    // In our app, we'll manually call their updates or let them re-query
    if (mockListeners.likes[itemId]) {
      mockListeners.likes[itemId].forEach(cb => {
        // We evaluate userHasLiked again dynamically inside the callback,
        // but since the callback was bound to a specific userId,
        // it requires re-running updateLikes logic.
        const filtered = allLikes.filter(l => l.itemId === itemId);
        // We'll pass the updated info
        cb({ totalLikes: filtered.length });
      });
    }
    return Promise.resolve(liked);
  }
};
