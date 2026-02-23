import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderResponseDto } from '../models/order'; // וודאי שיש לך את המודל הזה

@Injectable({
  providedIn: 'root'
})
export class AdminOrderService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7006/api/Orders';

  // שליפת כל ההזמנות המאושרות (למנהל בלבד)
  getAllConfirmedOrders(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}/Admine`);
  }
}