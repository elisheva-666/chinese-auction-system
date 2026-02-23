import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminOrderService } from '../../../services/admin-order-service';
import { OrderResponseDto, OrderItemResponseDto } from '../../../models/order';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';

// ממשק עזר לטבלה המקובצת
interface CustomerGroup {
  userId: number;
  userName: string; // ננסה לשלוף אם קיים, אחרת נציג ID
  totalSpent: number;
  totalItems: number;
  ordersCount: number;
  // התיקון: שימוש בטיפוס שיש לך בקובץ
  allItems: OrderItemResponseDto[];
}

@Component({
  selector: 'app-manager-users',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, InputTextModule, FormsModule, TooltipModule],
  templateUrl: './manager-users.html',
  styleUrl: './manager-users.scss'
})
export class ManagerUsers implements OnInit {

  private adminOrderService = inject(AdminOrderService);

  customers: CustomerGroup[] = [];
  filteredCustomers: CustomerGroup[] = [];
  searchTerm: string = '';

  displayDialog: boolean = false;
  selectedCustomer: CustomerGroup | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminOrderService.getAllConfirmedOrders().subscribe({
      next: (orders) => {
        this.processOrdersToCustomers(orders);
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  private processOrdersToCustomers(orders: OrderResponseDto[]) {
    const customerMap = new Map<number, CustomerGroup>();

    orders.forEach(order => {
      // אם הלקוח לא קיים במפה, יוצרים רשומה חדשה
      if (!customerMap.has(order.userId)) {
        // בדיקה אם השרת מחזיר שם משתמש בתוך האובייקט (גם אם לא ב-interface)
        // אם אין שם, נציג "לקוח #123"
        const nameFromApi = (order as any).userName || (order as any).user?.name;

        customerMap.set(order.userId, {
          userId: order.userId,
          userName: nameFromApi || `לקוח #${order.userId}`,
          totalSpent: 0,
          totalItems: 0,
          ordersCount: 0,
          allItems: []
        });
      }

      // עדכון הנתונים המצטברים
      const customer = customerMap.get(order.userId)!;
      customer.totalSpent += order.totalAmount;
      customer.ordersCount += 1;

      if (order.orderItems) {
        // הוספת הפריטים למערך המרוכז של הלקוח
        customer.allItems.push(...order.orderItems);
        // סיכום כמות הכרטיסים
        customer.totalItems += order.orderItems.reduce((acc, i) => acc + i.quantity, 0);
      }
    });

    this.customers = Array.from(customerMap.values());
    this.filteredCustomers = [...this.customers];
  }

  filterCustomers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredCustomers = this.customers.filter(c =>
      c.userName.toLowerCase().includes(term) ||
      c.userId.toString().includes(term)
    );
  }

  viewCustomerDetails(customer: CustomerGroup) {
    this.selectedCustomer = customer;
    this.displayDialog = true;
  }
}