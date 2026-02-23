import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WinnerByGift } from '../models/winner';

@Injectable({
  providedIn: 'root',
})
export class LotterySerice {

  private readonly BASE_URL = 'https://localhost:7006/api/Lottery';

  private http = inject(HttpClient);

  drawByGiftId(id: number): Observable<WinnerByGift> {
    console.log("שולח לשרת להגריל מתנה ", id);
    console.log(`${this.BASE_URL}/draw/${id}`, {});


    return this.http.post<WinnerByGift>(`${this.BASE_URL}/draw/${id}`, {});
  }

  //draw all
  drawAll(): Observable<WinnerByGift[]> {
    return this.http.post<WinnerByGift[]>(`${this.BASE_URL}/draw-all`, {});
  }

}
