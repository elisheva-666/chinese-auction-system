import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // 1. שליפת הטוקן מה-LocalStorage
  const token = localStorage.getItem('token');

  // 2. אם יש טוקן, נשכפל את הבקשה ונוסיף לה את כותרת ה-Authorization
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    // שולחים את הבקשה ה"משופרת" עם הטוקן
    return next(cloned);
  }

  // 3. אם אין טוקן (כמו בדף התחברות), הבקשה ממשיכה כרגיל ללא שינוי
  return next(req);
};