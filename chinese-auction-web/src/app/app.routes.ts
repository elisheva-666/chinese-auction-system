import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login';
import { RegisterComponent } from './components/auth/register/register';
import { GiftGallery } from './components//manager/gift-gallery/gift-gallery';
import { Home } from './pages/home/home';
import { GiftCatalog } from './components/gift/gift-catalog/gift-catalog';
import { ManagementDonor } from './components/manager/management-donor/management-donor';
import { Checkout } from './components/cart/checkout/checkout';
import { ManagerUsers } from './components/manager/manager-users/manager-users';
import { ManagementLottery } from './components/manager/management-lottery/management-lottery';
import { AdminDashboard } from './components/manager/admin-dashboard/admin-dashboard';
import { adminGuard } from './services/auth.guard';
import { About } from './pages/about/about';
 // <--- תוודאי שהייבוא נכון
export const routes: Routes = [
    { path: '', component: Home }, 
    { path: 'catalog', component: GiftCatalog },
    { path: 'about', component: About },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
     { path: 'checkout', component: Checkout },
    // הגדרת נתיבי ניהול (Manager)
    { 
        path: 'manager',
        canActivate: [adminGuard],
        children: [
            { path: '', component: GiftGallery }, // ברירת מחדל לניהול מתנות
            { path: 'gifts', component:  AdminDashboard }, // ניהול מתנות
            { path: 'donors', component:  GiftGallery  },   // ניהול תורמים
            { path: 'raffle', component: ManagementDonor  },   // זמני: הפניה להום עד שייבנה
            { path: 'reports', component: ManagerUsers } ,
         // זמני: הפניה להום עד שייבנה
        ]
    },

    // נתיב לטיפול במקרים של כתובת לא ידועה - החזרה לדף הבית
    { path: '**', redirectTo: '' }
];