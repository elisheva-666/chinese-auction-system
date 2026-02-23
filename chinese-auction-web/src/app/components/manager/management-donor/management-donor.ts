import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms'; // חובה בשביל ngModel
import { InputTextModule } from 'primeng/inputtext'; // עיצוב אינפוטים
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';

import { DonorService } from '../../../services/donor-service';
import { Donor, DonorUpsert } from '../../../models/donor';
import { DonorForm } from '../donor-form/donor-form';
import { GiftService } from '../../../services/gift-service';
import { GiftFormComponent } from '../../gift/gift-form/gift-form';
import { Category, GiftSubmission, GiftUpsert } from '../../../models/gift';

@Component({
  selector: 'app-management-donor',
  standalone: true,
  imports: [GiftFormComponent, CommonModule, ButtonModule, TableModule, DialogModule, DonorForm, FormsModule, InputTextModule, IconFieldModule, InputIconModule , TooltipModule, TagModule , CardModule],
  templateUrl: './management-donor.html',
  styleUrl: './management-donor.scss',
})
export class ManagementDonor implements OnInit {

  private donorService = inject(DonorService);

  listOfDonors: Donor[] = [];
  selectedDonor: Donor | null = null;
  displayDialog: boolean = false;
  // מתנה
  displayGiftDialog: boolean = false;
  selectedDonorForGift: Donor | null = null;
  categories: Category[] = [];
  private giftService = inject(GiftService);

  // משתנים לחיפוש
  searchName: string = '';
  searchEmail: string = '';

  ngOnInit() {
    this.loadDonors();
    this.loadCategories();
  }

  loadCategories() {
    this.giftService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('שגיאה בטעינת קטגוריות:', err)
    });
  }

  // openGiftDialog(donor: Donor) {
  //   this.selectedDonorForGift = donor;
  //   this.displayGiftDialog = true;
  // }

  // addGiftToDonor(gift: GiftUpsert) {
  //   // מוסיף donorId לאובייקט המתנה
  //   const giftWithDonor = { ...gift, donorId: this.selectedDonorForGift?.id };
  //   this.giftService.add(giftWithDonor).subscribe({
  //     next: () => {
  //       this.displayGiftDialog = false;
  //       alert('המתנה נוספה בהצלחה!');
  //     },
  //     error: (err) => {
  //       alert('שגיאה בהוספת מתנה: ' + (err?.error?.message || err.message));
  //     }
  //   });
  // }

  // פונקציה לפתיחת הדיאלוג
  openGiftDialog(donor: Donor) {
    this.selectedDonorForGift = donor;
    this.displayGiftDialog = true;
  }

  // הפונקציה שמקבלת את הנתונים מהטופס
  addGiftToDonor(event: GiftSubmission) {
    const donorId = this.selectedDonorForGift?.id;

    if (!donorId) {
      alert('שגיאה: לא נבחר תורם');
      return;
    }

    // שליחה ל-Service (שכבר תיקנו קודם לתמוך ב-File)
    this.giftService.addGiftToDonor(donorId, event.data, event.file).subscribe({
      next: () => {
        this.displayGiftDialog = false;
        alert('המתנה נוספה בהצלחה לתורם!');
        // אופציונלי: רענון רשימת התורמים או רשימת המתנות שלהם
      },
      error: (err) => {
        console.error('שגיאה בהוספת מתנה:', err);
        alert('שגיאה: ' + (err.error?.message || 'נכשל'));
      }
    });
  }


  loadDonors() {
    this.donorService.getAll().subscribe({
      next: (data) => this.listOfDonors = data,
      error: (err) => console.error('שגיאה בטעינה:', err)
    });
  }

  // === פונקציית החיפוש החדשה ===
  performSearch() {
    // אם שדה השם מלא - חפש לפי שם
    if (this.searchName && this.searchName.trim() !== '') {
      this.donorService.searchByName(this.searchName).subscribe({
        next: (data) => this.listOfDonors = data,
        error: (err) => console.error('שגיאה בחיפוש שם:', err)
      });
    } 
    // אחרת, אם שדה האימייל מלא - חפש לפי אימייל
    else if (this.searchEmail && this.searchEmail.trim() !== '') {
      this.donorService.searchByEmail(this.searchEmail).subscribe({
        next: (data) => this.listOfDonors = data,
        error: (err) => console.error('שגיאה בחיפוש אימייל:', err)
      });
    } 
    // אם שניהם ריקים - טען את הכל מחדש
    else {
      this.loadDonors();
    }
  }

  // איפוס החיפוש
  clearSearch() {
    this.searchName = '';
    this.searchEmail = '';
    this.loadDonors();
  }

  // ... שאר הפונקציות הקיימות (openNew, onEdit, saveDonor, delete) נשארות אותו דבר ...
  openNew() {
    this.selectedDonor = null;
    this.displayDialog = true;
  }

  onEdit(donor: Donor) {
    this.selectedDonor = donor;
    this.displayDialog = true;
  }

  saveDonor(donorData: DonorUpsert) {
    if (this.selectedDonor && this.selectedDonor.id) {
      this.donorService.update(this.selectedDonor.id, donorData).subscribe({
        next: () => {
          this.loadDonors();
          this.displayDialog = false;
        },
        error: (err) => console.error('שגיאה בעדכון:', err)
      });
    } else {
      this.donorService.create(donorData).subscribe({
        next: () => {
          this.loadDonors();
          this.displayDialog = false;
        },
        error: (err) => console.error('שגיאה ביצירה:', err)
      });
    }
  }

  delete(id: number) {
    if (confirm('למחוק?')) {
      this.donorService.delete(id).subscribe(() => this.loadDonors());
    }
  }

}