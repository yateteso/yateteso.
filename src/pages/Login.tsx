import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from '../types';

export function Login() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Ensure user document exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const isAdmin = user.email === 'yateteso900@gmail.com';
        const newProfile: User = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          isAdmin,
          wishlist: [],
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef, newProfile);
      }

      navigate('/');
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to sign in with Google';
      if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('auth/unauthorized-domain'))) {
        errorMessage = 'This domain is not authorized. Please make sure you have added both the dev and shared URLs to the "Authorized domains" list in Firebase Console -> Authentication -> Settings -> Authorized domains (scroll down to the "Authorized domains" section on that page).';
      } else if (err?.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-zinc-100">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Use your Google account to continue
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}

          <div>
            <Button 
              type="button" 
              className="w-full flex items-center justify-center gap-3 bg-white text-black border border-zinc-200 hover:bg-zinc-50" 
              disabled={loading}
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
