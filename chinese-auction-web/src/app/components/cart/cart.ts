import { Component, inject, OnInit, signal } from '@angular/core';
import { CartService } from '../../services/cart/cart-service';
import { ButtonModule } from 'primeng/button';
import { OrderResponseDto } from '../../models/order';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
    selector: 'app-cart',
    imports: [CommonModule, DrawerModule, ButtonModule],
    templateUrl: './cart.html',
    styleUrl: './cart.scss',
})
export class Cart  {

    cartService = inject(CartService);
    private router = inject(Router);
    // ngOnInit(): void {
    //     // טעינה ראשונית של העגלה כשהאפליקציה עולה
    //     this.cartService.getMyCart().subscribe();
    // }

    //פונקציה לפתיחת וסגירת העגלה
    toggleCart() {
        this.cartService.isCartVisible.update(prev => !prev);
        if (this.cartService.isCartVisible()) {
            this.cartService.getMyCart().subscribe();
        }
    }

checkout() {
  // 1. סגירת חלונית העגלה (כדי שלא תסתיר את דף התשלום)
  this.cartService.isCartVisible.set(false);

  // 2. ניווט לדף התשלום החדש
  // ודאי שב-app.routes.ts הגדרת את הנתיב 'checkout' לקומפוננטה החדשה
  this.router.navigate(['/checkout']);

}
}
