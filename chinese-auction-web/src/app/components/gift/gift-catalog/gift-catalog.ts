import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftService } from '../../../services/gift-service';
import { Gift } from '../../../models/gift';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule, SelectChangeEvent } from 'primeng/select';
import { CartService } from '../../../services/cart/cart-service';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../../services/auth-service'; // ודאי נתיב תקין
import { Router } from '@angular/router';

@Component({
  selector: 'app-gift-catalog',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, TagModule, FormsModule, InputTextModule, SelectModule, ToastModule, TooltipModule, ConfirmDialogModule],
  templateUrl: './gift-catalog.html',
  styleUrl: './gift-catalog.scss',
})
export class GiftCatalog implements OnInit {

  readonly IMAGE_BASE_URL = 'https://localhost:7006/';

  // הזרקות (Injections)
  private giftService = inject(GiftService);
  private cartService = inject(CartService);
  private authService = inject(AuthService); // השירות המרכזי לזיהוי משתמש
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  // סיגנלים לניהול מצב הקומפוננטה
  gifts = signal<Gift[]>([]);
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(true);

  sortOptions = [
    { label: 'מהזול ליקר', value: true },
    { label: 'מהיקר לזול', value: false }
  ];

  // פילטר חיפוש מחושב
  filteredGifts = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.gifts().filter(g =>
      g.name.toLowerCase().includes(term) ||
      g.categoryName.toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.loadGifts();
  }

  loadGifts() {
    this.giftService.getAllForCatalog().subscribe({
      next: (data) => {
        this.gifts.set(data)
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('לא הצליח לטעון מתנות', err);
        this.isLoading.set(false);
      }
    });
  }

  // לוגיקת הוספה לסל עם בדיקת התחברות
  addToCart(gift: Gift) {
    // שימוש בסיגנל מה-AuthService כדי לבדוק אם המשתמש מחובר
    if (!this.authService.isLoggedIn()) {
      this.confirmationService.confirm({
        header: 'נדרשת התחברות',
        message: `כדי להוסיף את "${gift.name}" לסל ולהשתתף בהגרלה, עליך להיות מחוברת למערכת.`,
        icon: 'pi pi-user-lock',
        acceptLabel: 'להתחברות / הרשמה',
        rejectLabel: 'ביטול',
        acceptButtonStyleClass: 'btn-primary',
        rejectButtonStyleClass: 'p-confirm-dialog-reject',
        accept: () => {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    // אם מחובר - מבצע הוספה לסל
    this.cartService.addToCart([{ giftId: gift.id, quantity: 1 }]).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'התווסף לסל!',
          detail: `${gift.name} ממתינה לך בעגלה`,
          life: 3000
        });
      },
      error: (err) => {
        console.error('שגיאה בהוספה לסל:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'אופס...',
          detail: 'הייתה בעיה בהוספת המתנה, נסי שוב מאוחר יותר.'
        });
      }
    });
  }

  onSortPrice(event: SelectChangeEvent) {
    this.giftService.getAllSortedByPriceAsc(event.value).subscribe({
      next: (data) => this.gifts.set(data),
      error: (err) => console.error('Error:', err)
    });
  }

  onSortCategory() {
    this.giftService.sortByCategory().subscribe({
      next: (data) => this.gifts.set(data),
      error: (err) => console.error('שגיאה במיון קטגוריה:', err)
    });
  }

  resetFilters() {
    this.searchTerm.set('');
    this.giftService.loadAllGifts(this.giftService.getAllForCatalog()).subscribe({
      error: (err) => console.error('Error:', err)
    });
  }

  // פונקציה להוספת מתנה לעגלה
//   addToCart(gift: Gift) {
//     this.cartService.addToCart([{ giftId: gift.id, quantity: 1 }]).subscribe({
//       next: () => {
//         console.log('Gift added to cart:', gift);
//       },
//       error: (err) => {
//         console.log('Error adding gift to cart:', gift);
//         console.error('Error adding gift to cart:', err);
//       }
//     });
//   }
//   isUserLoggedIn(): boolean {
 
//   return !!localStorage.getItem('token'); 
// }

}


