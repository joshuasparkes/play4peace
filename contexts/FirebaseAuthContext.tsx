'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, photoURL?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  isAuthenticated: boolean;
  emailVerified: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // console.log('🔶 Auth state changed:', firebaseUser?.uid);
      if (firebaseUser) {
        // console.log('🔶 Firebase user displayName:', firebaseUser.displayName);
        // console.log('🔶 Firebase user photoURL:', firebaseUser.photoURL);
        setFirebaseUser(firebaseUser);
        setEmailVerified(firebaseUser.emailVerified);

        // Fetch user profile from Firestore
        // console.log('🔶 Fetching Firestore profile...');
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          // console.log('🔶 Firestore data:', userData);
          setUser(userData);

          // Update last active
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            lastActive: new Date().toISOString(),
          });
        } else {
          // console.log('🔶 Creating new user profile in Firestore...');
          // Create user profile if it doesn't exist
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            ...(firebaseUser.photoURL && { photoURL: firebaseUser.photoURL }),
          };
          // console.log('🔶 New user data:', newUser);
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        // console.log('🔶 No authenticated user');
        setUser(null);
        setFirebaseUser(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, displayName: string, photoURL?: string) => {
    // console.log('🟢 signUp called with displayName:', displayName, 'photoURL:', photoURL);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // console.log('🟢 User created:', userCredential.user.uid);

    // Update Firebase Auth profile
    // console.log('🟢 Updating Firebase Auth profile...');
    await updateProfile(userCredential.user, {
      displayName,
      ...(photoURL && { photoURL })
    });
    // console.log('🟢 Firebase Auth profile updated');

    // Create Firestore user document
    const newUser: User = {
      uid: userCredential.user.uid,
      email,
      displayName,
      isAdmin: false,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      ...(photoURL && { photoURL })
    };

    // console.log('🟢 Creating Firestore document:', newUser);
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    // console.log('🟢 Firestore document created');

    // Send email verification with custom action URL
    // console.log('🟢 Sending verification email...');
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/action`,
      handleCodeInApp: true,
    };
    await sendEmailVerification(userCredential.user, actionCodeSettings);
    // console.log('🟢 Verification email sent');
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));

    if (!userDoc.exists()) {
      // Create new user document for first-time Google sign-in
      const newUser: User = {
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || 'User',
        isAdmin: false,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        ...(result.user.photoURL && { photoURL: result.user.photoURL })
      };

      await setDoc(doc(db, 'users', result.user.uid), newUser);
    } else {
      // Update last active for existing user
      await updateDoc(doc(db, 'users', result.user.uid), {
        lastActive: new Date().toISOString(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      // console.log('🔄 Refreshing user data...');
      // Reload Firebase Auth user to get latest emailVerified status
      await auth.currentUser.reload();

      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // console.log('🔄 Refreshed user data:', userData);
        setUser(userData);
      }
      // Update emailVerified status from reloaded auth user
      setEmailVerified(auth.currentUser.emailVerified);
    }
  };

  const resendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/action`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
    } else {
      throw new Error('No user logged in or email already verified');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signUp,
        login,
        signInWithGoogle,
        logout,
        refreshUser,
        resendVerificationEmail,
        isAuthenticated: !!user,
        emailVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useFirebaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within a FirebaseAuthProvider');
  }
  return context;
}
