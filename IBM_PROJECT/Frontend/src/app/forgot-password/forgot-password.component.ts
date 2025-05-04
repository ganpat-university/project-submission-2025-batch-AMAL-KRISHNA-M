import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  styleUrls: ['./forgot-password.component.css'],
  standalone: true,
  templateUrl: './forgot-password.component.html',
  imports: [
    FormsModule,
    CommonModule,
    AngularFireAuthModule,
    RouterModule
  ]
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private afAuth: AngularFireAuth) {}

  onResetPassword() {
    if (!this.email) {
      this.message = 'Please enter your email address.';
      return;
    }

    this.afAuth.sendPasswordResetEmail(this.email)
      .then(() => {
        this.message = 'Password reset link sent! Check your inbox.';
      })
      .catch((error) => {
        this.message = error.message;
      });
  }
}
