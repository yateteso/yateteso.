import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PhoneInput } from '../components/ui/PhoneInput';
import { User } from '../types';

export function Signup() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password || !displayName) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const formattedEmail = `${phone.replace(/[^0-9+]/g, '')}@yateteso.com`;
      
      const result = await createUserWithEmailAndPassword(auth, formattedEmail, password);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const isAdmin = phone === '+233557873784' || formattedEmail === 'yateteso900@gmail.com';
        const newProfile: User = {
          uid: user.uid,
          email: phone,
          displayName: displayName,
          isAdmin,
          wishlist: [],
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
      }
      navigate('/');
    } catch (err: any) {
      console.error(err);
      let errorMessage = 'Failed to create an account';
      if (err?.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this phone number already exists';
      } else if (err?.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
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
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Or{' '}
            <Link to="/login" className="font-medium text-black hover:underline">
              sign in to your account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</div>}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <PhoneInput
                required
                value={phone}
                onChange={setPhone}
                placeholder="e.g. 055 787 3784"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full flex items-center justify-center gap-3 bg-black text-white hover:bg-zinc-800" 
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>
      </div>
    </div>
  );
}
