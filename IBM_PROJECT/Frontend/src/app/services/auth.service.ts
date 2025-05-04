import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, filter, firstValueFrom, Observable, map, first } from 'rxjs';
import { UserCredential } from '@angular/fire/auth'; // ✅ Import this too

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean | null>(null);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable().pipe(
    filter(value => value !== null) // Prevents null from triggering guards
  );
  redirectUrl: string | null = null;
  user: User | null = null;

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, (user) => {
      console.log('Auth State Changed:', user);
      this.updateAuthState(user);
    });
  }

  get isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.updateAuthState(userCredential.user);
      console.log('User logged in:', userCredential.user);
      return userCredential; // ✅ This is important
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  checkAuthState(): Observable<boolean> {
    return this.isAuthenticated$.pipe(
      first(),
      map((isAuthenticated) => {
        console.log('Checking Auth State:', isAuthenticated);
        return isAuthenticated === true;
      })
    );
  }

  updateAuthState(user: User | null) {
    this.user = user;
    this.isAuthenticatedSubject.next(user !== null);
  }

  logout(): void {
    signOut(this.auth)
      .then(() => {
        console.log('User logged out');
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/intro']);
      })
      .catch(error => console.error('Logout failed:', error));
  }
}
