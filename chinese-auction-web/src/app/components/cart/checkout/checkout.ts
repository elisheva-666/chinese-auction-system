import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CartService } from '../../../services/cart/cart-service'; // וודאי שהנתיב נכון

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    ButtonModule, 
    InputTextModule, 
    ProgressSpinnerModule, 
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './checkout.html', // וודאי שהשם תואם לקובץ ה-HTML שלך
  styleUrl: './checkout.scss'     // וודאי שהשם תואם לקובץ ה-SCSS שלך
})
export class Checkout implements OnInit {
  
  // הזרקות
  private cartService = inject(CartService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  // משתנים
  paymentForm: FormGroup;
  isLoading = false;
  totalAmount = 0;
  selectedMethod: 'credit' | 'google' | 'paypal' = 'credit';

  constructor() {
    // יצירת הטופס עם ולידציות
    this.paymentForm = this.fb.group({
      cardHolder: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiry: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]], // MM/YY
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });
  }

  ngOnInit() {
    // שליפת הנתונים מהעגלה (סכום וכו')
    const cart = this.cartService.cartItems();
    
    if (cart) {
      // טיפול בבעיית אותיות גדולות/קטנות
      this.totalAmount = (cart as any).totalAmount || (cart as any).TotalAmount || 0;
    } else {
      // אם אין עגלה, נחזיר לדף הבית
      this.router.navigate(['/']);
    }
  }

  // החלפת שיטת תשלום (בשביל העיצוב)
  selectMethod(method: 'credit' | 'google' | 'paypal') {
    this.selectedMethod = method;
  }

  // === הפונקציה הראשית: ביצוע תשלום ===
  processPayment() {
    // 1. אם נבחר אשראי - בדיקת תקינות הטופס
    if (this.selectedMethod === 'credit' && this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: 'נא למלא פרטי אשראי תקינים' });
      return;
    }

    // 2. שליפת ה-ID של ההזמנה
    const currentCart = this.cartService.cartItems();
    // שימוש ב-$any ליתר ביטחון (אותיות גדולות/קטנות)
    const orderId = currentCart?.id || (currentCart as any)?.Id || (currentCart as any)?.OrderId;

    if (!orderId) {
      this.messageService.add({ severity: 'error', summary: 'תקלה', detail: 'לא נמצא מזהה הזמנה תקין' });
      console.error('Missing Order ID:', currentCart);
      return;
    }

    // 3. התחלת טעינה ושליחה לשרת
    this.isLoading = true;

    // קריאה לפונקציה האמיתית ב-Service
    this.cartService.checkout(orderId).subscribe({
      next: (response: any) => {
        // --- הצלחה ---
        this.isLoading = false;
        
        // הודעת הצלחה יפה (Toast)
        const msg = response?.message || 'הזמנה אושרה בהצלחה!';
        this.messageService.add({ severity: 'success', summary: 'אישור', detail: msg });

        // ניקוי העגלה (נעשה כבר ב-Service, אבל ליתר ביטחון)
        this.cartService.cartItems.set(null);
        this.cartService.isCartVisible.set(false);

        // מעבר לדף הבית/תודה אחרי 1.5 שניות (כדי שהמשתמש יראה את ההודעה)
        setTimeout(() => {
          this.router.navigate(['/']); 
        }, 1500);
      },
      error: (err) => {
        // --- כישלון ---
        this.isLoading = false;
        console.error('Checkout Error:', err);
        
        const errorMsg = err.error?.message || 'אירעה שגיאה בביצוע התשלום';
        this.messageService.add({ severity: 'error', summary: 'שגיאה', detail: errorMsg });
      }
    });
  }

  // פונקציית עזר לעיצוב מספר הכרטיס (רווחים כל 4 ספרות)
  formatCardNumber() {
    let val = this.paymentForm.get('cardNumber')?.value || '';
    return val.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim();
  }
}