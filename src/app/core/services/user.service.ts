// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private firestore: Firestore) {}

  async getUserProfile() {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return null;

    const userDocRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userDocRef);

    return userSnap.exists() ? userSnap.data() : null;
  }
}
