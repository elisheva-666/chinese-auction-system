import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = 'https://localhost:7006/api/Auth';

  private http = inject(HttpClient);

  // סיגנל לשמירת מצב המשתמש הנוכחי
  currentUser = signal<{ token: string | null, role: string | null }>({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('userRole')
  });

  // סיגנלים מחושבים למצב ההתחברות וההרשאות
  isLoggedIn = computed(() => !!this.currentUser().token);
  isAdmin = computed(() => this.currentUser().role === 'Admin');

  // פונקציה לרישום משתמש חדש
  register(userData: any): Observable<any> {
    // userData יכיל: name, email, phone, password
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // פונקציה לכניסת משתמש קיים
  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);

          if (response.user && response.user.role) {
            localStorage.setItem('userRole', response.user.role);
          }

          this.currentUser.set({ token: response.token, role: response.user?.role });
        }
      })
    );
  }
  
  // פונקציה להתנתקות משתמש
  logout(): void {
    localStorage.clear();
    this.currentUser.set({ token: null, role: null });
    console.log('התנתקת!');
    
  }
}