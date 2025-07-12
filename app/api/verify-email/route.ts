import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { email, code, password, role, name } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    // Get the verification document
    const userDocRef = doc(db, 'userVerifications', email);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'No verification request found for this email' }, { status: 404 });
    }

    const userData = userDoc.data();
    const {code: storedCode, expiry } = userData;

    // Check if code is expired
    const now = new Date();
    const expiryDate = expiry.toDate ? expiry.toDate() : new Date(expiry);
    
    if (now > expiryDate) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Check if code matches
    if (code !== storedCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in users collection
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role,
      uid: user.uid,
      createdAt: new Date(),
      emailVerified: true
    });

    // Delete the verification document
    await deleteDoc(userDocRef);

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully',
      user: {
        uid: user.uid,
        email: user.email,
        name,
        role
      }
    });

  } catch (error: any) {
    console.error('Error verifying email:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 