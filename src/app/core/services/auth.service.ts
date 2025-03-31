import { Injectable } from '@angular/core';
import { Auth, onAuthStateChanged, signInAnonymously, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: User | null = null;
  private userData: any = null;
  private loggedIn$ = new ReplaySubject<boolean>(1);

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.currentUser = user;
  
        const docSnap = await getDoc(doc(this.firestore, 'users', user.uid));
        if (docSnap.exists()) {
          this.userData = docSnap.data();
        } else {
          // Optional: Markiere Gäste eindeutig
          this.userData = { isGuest: true };
        }
  
        // Egal ob echter User oder Gast – er ist eingeloggt
        this.loggedIn$.next(true);
  
      } else {
        // Kein User angemeldet
        this.loggedIn$.next(false);
      }
    });
  }  

  isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUserData(): any {
    return this.userData;
  }

  logout(): void {
    this.auth.signOut();
  }

  async loginAsGuest(): Promise<void> {
    try {
      const result = await signInAnonymously(this.auth);
      console.log('Angemeldet als Gast:', result.user);
      // loggedIn$ wird automatisch durch onAuthStateChanged aktualisiert
    } catch (error) {
      console.error('Fehler beim Guest-Login:', error);
    }
  }
}
