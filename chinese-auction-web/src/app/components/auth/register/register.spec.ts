import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ייבוא חובה בשביל הטפסים
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service'; // ודאי שהנתיב נכון

@Component({
  selector: 'app-register',
  standalone: true, // הגדרה שזו קומפוננטה עצמאית
  imports: [CommonModule, FormsModule], // חובה להוסיף כאן את FormsModule
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  // האובייקט שמכיל את הנתונים מהטופס
  user = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    this.authService.register(this.user).subscribe({
      next: (res) => {
        alert('הרישום בוצע בהצלחה! מעביר להתחברות...');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        // הצגת הודעת שגיאה מהשרת או הודעה כללית
        alert('שגיאה ברישום: ' + (err.error?.message || 'נסה שוב מאוחר יותר'));
      }
    });
  }
}