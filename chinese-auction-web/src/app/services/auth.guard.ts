import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 1. שליפת הטוקן מה-LocalStorage (כפי שראינו ב-AuthController)
  const token = localStorage.getItem('token'); 
  
  // 2. בדיקה אם המשתמש הוא מנהל
  // הערה: מומלץ לפענח את ה-JWT ולבדוק Role. כרגע נבדוק פשוט אם יש טוקן מזהה
  const userRole = localStorage.getItem('userRole'); // תוודא שאתה שומר את ה-Role בזמן ה-Login

  if ( userRole === 'Admin') {
    console.log("אנחנו כאן ךא מסכים להיכנס");
    
    return true; // המשתמש מורשה, אפשר להיכנס
  }

  // 3. אם לא מנהל - זרוק אותו לדף ה-Login
  router.navigate(['/home']);
  return false;
};