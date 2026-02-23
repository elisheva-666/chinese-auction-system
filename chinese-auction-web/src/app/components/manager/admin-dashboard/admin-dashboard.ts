import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiftService } from '../../../services/gift-service';
import { DonorService } from '../../../services/donor-service';
import { AdminOrderService } from '../../../services/admin-order-service';
import { Gift } from '../../../models/gift';

// PrimeNG Imports
import { ChartModule } from 'primeng/chart';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

// ייבוא הקומפוננטות הקיימות שלך כדי להציג אותן בתוך הדשבורד
import { GiftGallery } from '../gift-gallery/gift-gallery';
import { ManagementDonor } from '../management-donor/management-donor';
import { ManagerUsers } from '../manager-users/manager-users';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ChartModule, 
    TabsModule, 
    CardModule,
    ButtonModule,
    // הקומפוננטות שלך:
    GiftGallery,
    ManagementDonor,
    ManagerUsers
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {

  // הזרקת השירותים
  private giftService = inject(GiftService);
  private donorService = inject(DonorService);
  private adminOrderService = inject(AdminOrderService);

  // משתנים לסטטיסטיקה
  totalRevenue: number = 0;
  totalGifts: number = 0;
  totalDonors: number = 0;
  topGiftName: string = '---';

  // נתונים לגרפים
  barData: any;
  barOptions: any;
  pieData: any;
  pieOptions: any;

  ngOnInit() {
    this.loadDashboardData();
    this.initChartOptions();
  }

  loadDashboardData() {
    // 1. טעינת נתוני מתנות (לחישוב כמות ומציאת המתנה המובילה)
    this.giftService.getAll().subscribe(gifts => {
      this.totalGifts = gifts.length;
      
      // מציאת המתנה עם הכי הרבה רוכשים
      const topGift = gifts.sort((a, b) => (b.ticketPrice || 0) - (a.ticketPrice || 0))[0];
      if (topGift) this.topGiftName = topGift.name;

      // בניית גרף פאי - התפלגות קטגוריות (דוגמה)
      this.updatePieChart(gifts);
    });

    // 2. טעינת תורמים
    this.donorService.getAll().subscribe(donors => {
      this.totalDonors = donors.length;
    });

    // 3. טעינת הזמנות (לחישוב הכנסות)
    this.adminOrderService.getAllConfirmedOrders().subscribe(orders => {
      this.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // בניית גרף עמודות - הכנסות (דמי)
      // כאן אפשר לעשות לוגיקה אמיתית של הכנסות לפי חודשים אם יש תאריכים
      this.updateBarChart(); 
    });
  }

  updatePieChart(gifts: Gift[]) {
    // לוגיקה פשוטה: ספירת מתנות לפי מחיר כרטיס (לדוגמה)
    // במציאות עדיף לפי קטגוריה אם יש לך את השם שלה זמין באובייקט
    const cheap = gifts.filter(g => g.ticketPrice <= 20).length;
    const medium = gifts.filter(g => g.ticketPrice > 20 && g.ticketPrice <= 50).length;
    const expensive = gifts.filter(g => g.ticketPrice > 50).length;

    this.pieData = {
      labels: ['זול (עד 20₪)', 'בינוני (20-50₪)', 'יוקרתי (50₪+)'],
      datasets: [
        {
          data: [cheap, medium, expensive],
          backgroundColor: ['#06b6d4', '#bd00ff', '#eab308'],
          hoverBackgroundColor: ['#0891b2', '#a21caf', '#ca8a04']
        }
      ]
    };
  }

  updateBarChart() {
    this.barData = {
      labels: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'],
      datasets: [
        {
          label: 'הכנסות (₪)',
          data: [1200, 1900, 300, 500, 200, this.totalRevenue], // נתונים לדוגמה + הסך הכל
          backgroundColor: 'rgba(6, 182, 212, 0.5)',
          borderColor: '#06b6d4',
          borderWidth: 1
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = '#ffffff';
    const textColorSecondary = 'rgba(255, 255, 255, 0.6)';
    const surfaceBorder = 'rgba(255, 255, 255, 0.1)';

    this.barOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };

    this.pieOptions = {
      plugins: {
        legend: {
          labels: { usePointStyle: true, color: textColor }
        }
      }
    };
  }
}
