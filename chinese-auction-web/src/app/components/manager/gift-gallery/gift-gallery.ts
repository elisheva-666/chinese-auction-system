

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, Gift, GiftUpsert } from '../../../models/gift';
import { WinnerByGift } from '../../../models/winner';
import { GiftService } from '../../../services/gift-service';
import { LotterySerice } from '../../../services/lottery-service';
import { GiftFormComponent } from '../../gift/gift-form/gift-form';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip'; // חובה בשביל הבועות!


@Component({
  selector: 'app-gift-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, GiftFormComponent, ButtonModule, DialogModule, TableModule, TooltipModule],
  templateUrl: './gift-gallery.html',
  styleUrl: './gift-gallery.scss',
})
export class GiftGallery implements OnInit {

  readonly IMAGE_BASE_URL = 'https://localhost:7006/';

  donorId = signal<number>(1); //זמי!!!
  categories: Category[] = []; // משתנה לשמירת הקטגוריות

  ngOnInit() {
    this.loadGifts();
    this.loadCategories(); // <--- קריאה חדשה
  }
  private giftService = inject(GiftService);
  private lotteryService = inject(LotterySerice);


  listOfGifts: Gift[] = [];
  selectedGift: Gift | null = null;
  displayDialog: boolean = false;
  displayWinnerDialog = signal<boolean>(false);
  winner = signal<WinnerByGift | null>(null);

  //get all categories
  loadCategories() {
    this.giftService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log('קטגוריות נטענו:', data); // לבדיקה שהנתונים הגיעו
      },
      error: (err) => console.error('לא הצליח לטעון קטגוריות', err)
    });
  }


  //get all gifts
  loadGifts() {
    this.giftService.getAll().subscribe({
      next: data => {
        this.listOfGifts = data;
        // גם עדכן את ה-shared signal בservice כדי שgift-catalog תעדכן בעת הגרלה
        this.giftService.setGiftsInSignal(data);
        console.log('מתנות נטענו:', data); // לבדיקה שהנתונים הגיעו
      },
      error: err => console.error('Failed to load gifts', err)
    });
  }

  //להוסיף מתנה
  onAdd() {
    this.selectedGift = null; // מאפסים את המתנה כדי שהטופס ייפתח ריק
    this.displayDialog = true;
  }

  // open dialog to edit gift
  onEdit(gift: Gift) {
    this.selectedGift = { ...gift };
    this.displayDialog = true;
  }

  onSaveGift(event: { data: GiftUpsert; file: File | null }) {
    const currentDonorId = this.donorId();

    if (this.selectedGift) {
      // לוגיקה לעדכון מתנה קיימת (צריך להוסיף פונקציה כזו ב-Service שתומכת ב-FormData)
      this.giftService.updateWithFile(this.selectedGift.id, event.data, event.file).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => console.error(err)
      });
    } else {
      // הוספה
      this.giftService.addGiftToDonor(currentDonorId, event.data, event.file).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => console.error(err)
      });
    }
  }

  private handleSuccess() {
    this.loadGifts();
    this.closeDialog();
  }

  closeDialog() {
    this.displayDialog = false;
    this.selectedGift = null;
  }
  //delete gift
  delete(id: number) {
    if (confirm('האם אתה בטוח שברצונך למחוק?')) {
      this.giftService.delete(id).subscribe(() => {
        this.listOfGifts = this.listOfGifts.filter(g => g.id !== id);
      });
    }
  }

  // פונקציה לדוגמה להפעלת הגרלה על מתנה מסוימת
  lottery(giftId: number) {
    console.log("פונקציית הגרלה מניהול מתנות");
    if (confirm('האם אתה בטוח שברצונך להגריל מתנה זו?')) {
      this.lotteryService.drawByGiftId(giftId).subscribe({
        next: (winnerData) => {
          console.log('הגרלה בוצעה בהצלחה:', winnerData);
          
          // הצג את הזוכה בדיאלוג
          this.winner.set(winnerData);
          this.displayWinnerDialog.set(true);
          
          // עדכן את המתנה בshared service - זה יעדכן גם את הקטלוג
          this.giftService.updateGiftWithLottery(giftId, winnerData.winnerName);
          
          // עדכן את המתנה ברשימה המקומית - סמן אותה כהוגרל עם שם הזוכה
          const giftIndex = this.listOfGifts.findIndex(g => g.id === giftId);
          if (giftIndex !== -1) {
            this.listOfGifts[giftIndex] = {
              ...this.listOfGifts[giftIndex],
              isDrawn: true,
              winnerName: winnerData.winnerName
            };
            // עדכן את ה-array כדי שAngular יזהה את השינוי
            this.listOfGifts = [...this.listOfGifts];
          }
        },
        error: (error) => {
          console.error('שגיאה בהגרלה:', error);
          alert('שגיאה בביצוע ההגרלה');
        }
      });
    }
  }

  closeWinnerDialog() {
    this.displayWinnerDialog.set(false);
    this.winner.set(null);
  }

}
