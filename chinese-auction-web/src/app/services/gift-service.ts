// 



import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, Gift, GiftUpsert } from '../models/gift';

@Injectable({
  providedIn: 'root',
})
export class GiftService {

  private readonly BASE_URL = 'https://localhost:7006/api/Gift';

  private http = inject(HttpClient);

  // Shared state for gifts across components
  private giftsSignal = signal<Gift[]>([]);
  public gifts$ = this.giftsSignal.asReadonly();

  // set gifts to shared signal
  setGiftsInSignal(gifts: Gift[]): void {
    this.giftsSignal.set(gifts);
  }

  /** ===================== CRUD ===================== */

  /** ===================== USER ===================== */



  // שליפת כל המתנות עבור קטלןג מתנות
  getAllForCatalog(): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.BASE_URL}`);
  }

  //שליפת כל המתנות ממוין לפי מחיר עולה
  getAllSortedByPriceAsc(asc: boolean): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.BASE_URL}/sort-by-price?asc=${asc}`);
  }

  //שליפת כל המתנות ממוין לפי קטגוריה
  sortByCategory(): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.BASE_URL}/sort-by-category`);
  }

  // עדכון מתנה מסוימת עם פרטי הגרלה
  updateGiftWithLottery(giftId: number, winnerName: string): void {
    const gifts = this.giftsSignal();
    const updatedGifts = gifts.map(gift =>
      gift.id === giftId
        ? { ...gift, isDrawn: true, winnerName }
        : gift
    );
    this.giftsSignal.set(updatedGifts);
  }

  // טעינת כל המתנות ו-caching ל-signal
  loadAllGifts(endpoint: Observable<Gift[]>): Observable<Gift[]> {
    return new Observable(observer => {
      endpoint.subscribe({
        next: (data) => {
          this.giftsSignal.set(data);
          observer.next(data);
        },
        error: (err) => observer.error(err)
      });
    });
  }

  /** ===================== עזרים ===================== */
  // פונקציית עזר כדי לא לשכפל קוד ביצירה ובעדכון
  private buildFormData(giftData: GiftUpsert, file: File | null): FormData {
    const formData = new FormData();

    formData.append('Name', giftData.name);
    formData.append('Description', giftData.description || '');
    formData.append('TicketPrice', giftData.ticketPrice.toString());

    if (file && file instanceof File) {
      formData.append('ImageUrl', file, file.name);
    }

    // שליחה מפורשת של ה-ID כמספר
    // const categoryId = giftData.categoryId;
    formData.append('CategoryId', giftData.categoryId.toString());





    return formData;
  }

  /** ===================== ADMINE ===================== */

  // הוספת מתנה
  addGiftToDonor(donorId: number, giftData: GiftUpsert, file: File | null): Observable<any> {
    const formData = this.buildFormData(giftData, file);
    return this.http.post(`${this.BASE_URL}/admin/add-to-donor/${donorId}`, formData);
  }

  // עדכון מתנה כולל קובץ
  updateWithFile(id: number, giftData: GiftUpsert, file: File | null): Observable<Gift> {
    const formData = this.buildFormData(giftData, file);
    return this.http.put<Gift>(`${this.BASE_URL}/${id}`, formData);
  }

  // הפונקציה הישנה - השארתי למקרה ויש לך שימוש אחר, אבל עדיף להשתמש בחדשה
  // update(id: number, gift: GiftUpsert): Observable<Gift> {
  //   return this.http.put<Gift>(`${this.BASE_URL}/${id}`, gift);
  // }

  //  שליפת כל המתנות עבור מנהל
  getAll(): Observable<Gift[]> {
    return this.http.get<Gift[]>(`${this.BASE_URL}/admin`);
  }

  //  שליפת מתנה בודדת לפי ID
  getById(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.BASE_URL}/${id}`);
  }

  //  מחיקת מתנה לפי ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }





  /** ===================== תוספות של קריאות ===================== */
  //get all catergories

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`https://localhost:7006/api/Category`);
  }



}




