import { Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, UserCredential, User, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { MfaComponent } from '../mfa/mfa.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SecurityContext } from '@angular/core';
import { FirebaseService } from '../firebase.service';
import { PhoneAuthProvider, signInWithCredential } from '@firebase/auth';
import { AuthService } from '../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MfaComponent, RouterModule]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showLoginForm: boolean = true;

  registerEmail: string = '';
  registerPassword: string = '';
  registerConfirmPassword: string = '';
  registerPhoneNumber: string = '+91';
  termsAccepted: boolean = false;
  private verificationId: string = '';
  registrationInProgress: boolean = false;
  verificationSuccess: EventEmitter<void> = new EventEmitter();
  verificationFailed: EventEmitter<any> = new EventEmitter();

  isVerifyingPhone: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private router: Router,
    private auth: Auth,
    private firebaseService: FirebaseService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  toggleForm() {
    this.showLoginForm = !this.showLoginForm;
    this.clearMessage();
  }

  clearMessage() {
    this.message = '';
    this.messageType = '';
  }

  setMessage(message: string, type: 'success' | 'error') {
    this.message = this.sanitizer.sanitize(SecurityContext.HTML, message) || '';
    this.messageType = type;
    setTimeout(() => {
      this.clearMessage();
    }, 2000);
  }

  async login() {
    if (!this.email || !this.password) {
      this.setMessage('Please enter both email and password.', 'error');
      return;
    }
  
    try {
      const userCredential: UserCredential = await this.authService.login(this.email, this.password);
      const user: User = userCredential.user;
  
      // Important: Reload the user to get fresh status
      await user.reload();
      
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        this.setMessage('Please verify your email. A verification email has been sent.', 'error');
        await this.auth.signOut();  // logout user immediately
        return;
      }
  
      await this.firebaseService.logLoginEvent(this.email, 'email/password', true);
      sessionStorage.setItem('isLoggedIn', 'true');
  
      if (this.rememberMe) {
        sessionStorage.setItem('email', this.email);
      }
  
      this.setMessage('Login successful!', 'success');
      setTimeout(() => {
        const redirectUrl = this.authService.redirectUrl ? this.authService.redirectUrl : '/home';
        this.router.navigate([redirectUrl]);
      }, 1000);
  
    } catch (error: any) {
      await this.firebaseService.logLoginEvent(this.email, 'email/password', false);
      console.error('Login error:', error);
      this.setMessage(`Login failed: ${error.message}`, 'error');
    }
  }
  

  async register() {
    if (!this.termsAccepted) {
      this.setMessage('You must agree to the terms and conditions.', 'error');
      return;
    }

    if (this.registerPassword !== this.registerConfirmPassword) {
      this.setMessage('Passwords do not match.', 'error');
      return;
    }

    if (!this.registerPhoneNumber) {
      this.setMessage('Phone number is required.', 'error');
      return;
    }

    this.isVerifyingPhone = true;
  }

  async verifyCode(code: string) {
    try {
      if (!this.verificationId || !code) {
        console.error('Verification ID or code is missing');
        return;
      }

      const credential = PhoneAuthProvider.credential(this.verificationId, code);
      await signInWithCredential(this.auth, credential);

      console.log('Phone number verified successfully');
      this.onMfaSuccess();
    } catch (error) {
      console.error('Failed to verify the code:', error);
      this.verificationFailed.emit(error);
      this.registrationInProgress = false;
    }
  }

  async onMfaSuccess() {
    try {
      if (!this.registerEmail || !this.registerPassword) {
        console.error('Email or password is missing.');
        this.setMessage('Please provide a valid email and password.', 'error');
        return;
      }

      const userCredential: UserCredential = await createUserWithEmailAndPassword(this.auth, this.registerEmail, this.registerPassword);
      const user: User = userCredential.user;

      if (user) {
        await sendEmailVerification(user); // Call imported function, pass user object  ;
        this.setMessage('Registration successful! A verification email has been sent. Please verify your email before logging in.', 'success');
      }

      this.isVerifyingPhone = false;
      this.toggleForm();
    } catch (error: any) {
      console.error('Registration error:', error);
      this.setMessage(`Registration failed: ${error.message}`, 'error');
    }
  }

  onMfaFailed(error: any) {
    console.error('MFA verification failed:', error);
    this.setMessage(`MFA verification failed: ${error.message}`, 'error');
    this.isVerifyingPhone = false;
  }

  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      if (result.user) {
        this.setMessage(`Welcome ${result.user.displayName}`, 'success');
        await this.firebaseService.logLoginEvent(result.user.email || 'Unknown', 'google', true);

        this.authService.updateAuthState(result.user);

        setTimeout(() => {
          const redirectUrl = this.authService.redirectUrl ? this.authService.redirectUrl : '/home';
          this.router.navigate([redirectUrl]);
        }, 2000);
      }
    } catch (error: any) {
      await this.firebaseService.logLoginEvent('Unknown', 'google', false);
      console.error('Google Sign-In Error:', error);
      this.setMessage(`Login failed: ${error.message}`, 'error');
    }
  }

}
