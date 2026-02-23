import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { IftaLabelModule } from 'primeng/iftalabel'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule, IconFieldModule , InputIconModule, IftaLabelModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  isLoading = signal(false);
  errorMessage = signal<string | undefined>(undefined);
  @Output() onSuccess = new EventEmitter<void>();
  @Output() switchToRegister = new EventEmitter<void>();
  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.isLoading.set(true);
    this.errorMessage.set(undefined);

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('התחברות הצליחה, התקבל טוקן:', response.token);
        this.isLoading.set(false);
         this.onSuccess.emit();

        this.router.navigate(['/gallery']);
      
      },
      error: (err) => {
        this.isLoading.set(false);
        const message = err.error?.message || 'בדוק את המייל והסיסמה';
        this.errorMessage.set('התחברות נכשלה: ' + message);
        console.error('פרטי שגיאת:', err.error);
      }
    });
  }
}