import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Donor, DonorUpsert } from '../models/donor';

@Injectable({
  providedIn: 'root',
})
export class DonorService {
  private readonly BASE_URL = 'https://localhost:7006/api/Donor';
  private http = inject(HttpClient);

  getAll(): Observable<Donor[]> {
    return this.http.get<Donor[]>(`${this.BASE_URL}`); 
  }

  create(donor: DonorUpsert): Observable<Donor> {
    return this.http.post<Donor>(this.BASE_URL, donor);
  }

  update(id: number, donor: DonorUpsert): Observable<Donor> {
    return this.http.put<Donor>(`${this.BASE_URL}/${id}`, donor);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/${id}`);
  }

  // === הוספת הפונקציות החדשות לחיפוש ===
  
  // חיפוש לפי שם
  searchByName(name: string): Observable<Donor[]> {
    return this.http.get<Donor[]>(`${this.BASE_URL}/search/name?name=${name}`);
  }

  // חיפוש לפי אימייל
  searchByEmail(email: string): Observable<Donor[]> {
    return this.http.get<Donor[]>(`${this.BASE_URL}/search/email?email=${email}`);
  }
}