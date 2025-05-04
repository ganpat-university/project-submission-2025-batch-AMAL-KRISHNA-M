import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../environments/environment';
import { Firestore, getFirestore, collection, doc, runTransaction, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private auth;
  private firestore: Firestore;

  constructor() {
    const firebaseConfig = environment.firebaseConfig;
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
    this.firestore = getFirestore(app);
  }

  getAuthInstance() {
    return this.auth;
  }

  async logLoginEvent(email: string, loginMethod: string, success: boolean): Promise<void> {
    const logData = {
      email: email || 'Unknown',
      timestamp: new Date().toISOString(),
      device: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      loginMethod,
      success,
    };

    try {
      const logRef = collection(this.firestore, 'loginLogs');
      const counterRef = doc(this.firestore, 'counters', 'logCounter');

      let logNumber: number; // Declare logNumber outside the transaction
      try {
        logNumber = await runTransaction(this.firestore, async (transaction) => {
          const counterDoc = await transaction.get(counterRef);
          if (!counterDoc.exists()) {
            transaction.set(counterRef, { lastLogNumber: 0 });
            return 1;
          }
          const lastLogNumber = counterDoc.data()['lastLogNumber'];
          const newLogNumber = lastLogNumber + 1;
          transaction.update(counterRef, { lastLogNumber: newLogNumber });
          return newLogNumber;
        });
      } catch (transactionError) {
        console.error("Transaction Error:", transactionError);
        throw transactionError; // Re-throw the error
      }


      const logId = `log_${logNumber}`;
      const logDocRef = doc(logRef, logId);
      await setDoc(logDocRef, logData);

      console.log('Login log saved to Firestore with ID:', logId, logData);
    } catch (error: any) {
      console.error('Error logging login event:', error);
      throw error; // Re-throw the error
    }
  }
}
