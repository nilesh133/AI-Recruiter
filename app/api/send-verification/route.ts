import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendMail } from '@/helpers/lib';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Debug: Check if db is properly initialized
    if (!db) {
      console.error('Firebase db is not initialized');
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Generate a 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry time (10 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);

    console.log('Creating document reference for:', email);
    
    // Check if user already exists in verification collection
    const userDocRef = doc(db, 'userVerifications', email);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Update existing verification record
      await setDoc(userDocRef, {
        email,
        code: verificationCode,
        expiry: expiryTime,
        updatedAt: new Date()
      });
    } else {
      // Create new verification record
      await setDoc(userDocRef, {
        email,
        code: verificationCode,
        expiry: expiryTime,
        createdAt: new Date()
      });
    }

    // Send verification email
    const emailSubject = 'Email Verification - AICruit';
    const emailText = `
      Hello,
      
      Your verification code is: ${verificationCode}
      
      This code will expire in 10 minutes.
      
      If you didn't request this verification, please ignore this email.
      
      Best regards,
      AICruit Team
    `;

    const emailResult = await sendMail({
      emailTo: email,
      subject: emailSubject,
      text: emailText,
      cc: [],
      bcc: [],
      attachments: []
    });

    if (!emailResult.status) {
      return NextResponse.json({ error: 'Failed to send verification email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 