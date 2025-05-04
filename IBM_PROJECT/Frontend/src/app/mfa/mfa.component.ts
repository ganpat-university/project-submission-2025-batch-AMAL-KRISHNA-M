import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RecaptchaVerifier, signInWithPhoneNumber, Auth, ConfirmationResult, PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { FirebaseService } from '../firebase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mfa',
  templateUrl: './mfa.component.html',
  styleUrls: ['./mfa.component.css'],
  imports: [CommonModule, FormsModule]
})
export class MfaComponent implements OnInit {
  @Input() phoneNumber: string = '';
  @Output() verificationSuccess: EventEmitter<void> = new EventEmitter();
  @Output() verificationFailed: EventEmitter<any> = new EventEmitter();

  appVerifier: any;
  verificationCode: string = '';
  private verificationId: string = '';
  codeSent: boolean = false;

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit(): void {
    this.initializeRecaptcha();
  }
  // Function to initialize reCAPTCHA
  initializeRecaptcha() {
    const auth: Auth = this.firebaseService.getAuthInstance();
    this.appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: (response: string) => {
        console.debug('reCAPTCHA completed:', response);
      }
    });
  }
  // Function to send the verification code to the user's phone number
  async sendVerificationCode() {
    const auth: Auth = this.firebaseService.getAuthInstance();
    try {
      const confirmationResult: ConfirmationResult = await signInWithPhoneNumber(auth, this.phoneNumber, this.appVerifier);
      console.debug('Verification code sent');
      this.verificationId = confirmationResult.verificationId;
      this.codeSent = true;
    } catch (error) {
      console.debug('Failed to send code:', error);
      this.verificationFailed.emit(error);
    }
  }
  
  // Function to verify the code entered by the user
  async verifyCode(code: string) {
    const auth: Auth = this.firebaseService.getAuthInstance();
    try {
      if (!this.verificationId || !code) {
        console.debug('Verification ID or code is missing');
        return;
      }

      const credential = PhoneAuthProvider.credential(this.verificationId, code);
      await signInWithCredential(auth, credential);
      console.debug('Phone number verified successfully');
      this.verificationSuccess.emit();  // Emit success after the code is successfully verified
    } catch (error) {
      console.debug('Failed to verify the code:', error);
      this.verificationFailed.emit(error);
    }
  }
}
