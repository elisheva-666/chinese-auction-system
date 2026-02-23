import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CartService } from '../../../services/cart/cart-service';
import { AuthService } from '../../../services/auth-service';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { LoginComponent } from "../../auth/login/login";
import { RegisterComponent } from "../../auth/register/register";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ButtonModule, CommonModule, DrawerModule, LoginComponent, RegisterComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit, OnDestroy {

  private router = inject(Router);
  cartService = inject(CartService);
  authService = inject(AuthService);

  isLoggedIn = this.authService.isLoggedIn;
  isAdmin = this.authService.isAdmin;
  isAuthVisible = signal<boolean>(false); // סיגנל חדש לנראות חלונית ההתחברות
  authMode = signal<'login' | 'register'>('login'); // סיגנל למעבר בין התחברו

  // --- לוגיקת טיימר ---
  targetDate: Date = new Date();
  countdown: any = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private intervalId: any;

  ngOnInit() {
    // הגדרת תאריך היעד: עוד שבועיים מהיום
    this.targetDate.setDate(this.targetDate.getDate() + 14);
    
    this.startTimer();
  }
  

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  startTimer() {
    this.updateTime(); // הרצה ראשונית
    this.intervalId = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  updateTime() {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance < 0) {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      clearInterval(this.intervalId);
      return;
    }

    this.countdown = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
  openLogin() {
    this.authMode.set('login');
    this.isAuthVisible.set(true);
  }

  openRegister() {
    this.authMode.set('register');
    this.isAuthVisible.set(true);
  }
}