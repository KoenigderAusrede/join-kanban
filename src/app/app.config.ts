import { bootstrapApplication } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),  // 🔥 Firebase App initialisieren
    provideFirestore(() => getFirestore()),  // 🔥 Firestore als Provider hinzufügen
  ]
}).catch(err => console.error(err));
