import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedFile: File | null = null;
  uploadMessage: string = '';
  messageColor: string = '';
  loading: boolean = false; // Loading state

  constructor(private apiService: ApiService, private router: Router) {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }
  
  analyzeSentiment(): void {
    if (!this.selectedFile) {
      alert('Please select a file!');
      return;
    }

    this.loading = true; // Show loading spinner

    this.apiService.uploadCSV(this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.uploadMessage = 'File Uploaded Successfully!';
        this.messageColor = 'green';

        setTimeout(() => {
          this.uploadMessage = '';
          this.router.navigate(['/dashboard']); // Redirect after 1s
        }, 2000);
      },
      error: () => {
        this.loading = false;
        this.uploadMessage = 'File Upload Failed!';
        this.messageColor = 'red';

        setTimeout(() => {
          this.uploadMessage = '';
        }, 1000);
      }
    });
  }
}
