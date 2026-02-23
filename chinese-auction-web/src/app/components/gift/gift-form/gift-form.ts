import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Gift, GiftUpsert, Category, GiftSubmission } from '../../../models/gift'
import { FormsModule } from '@angular/forms';

// PrimeNG 20 Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select'; // בגרסה 20 זה Select במקום Dropdown
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-gift-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, ButtonModule, FileUploadModule, TextareaModule],
  templateUrl: './gift-form.html',
  styleUrl: './gift-form.scss'
})
export class GiftFormComponent {

  /* ===== Inputs ===== */
  @Input() giftToEdit: Gift | null = null;
  @Input() categories: Category[] = [];

  /* ===== Outputs ===== */
  // @Output() save = new EventEmitter<GiftUpsert>();
  @Output() cancel = new EventEmitter<void>();

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    ticketPrice: new FormControl(0, [Validators.required, Validators.min(0.1), Validators.max(10000)]),
    description: new FormControl(''),
    imageUrl: new FormControl(''),
    categoryId: new FormControl<number | null>(null, Validators.required)
  });

  ngOnChanges(changes: SimpleChanges): void {
    // איפוס חובה של הקובץ בכל פעם שהטופס מוצג מחדש!
    this.selectedFile = null;

    if (this.giftToEdit) {
      this.form.patchValue({
        name: this.giftToEdit.name,
        ticketPrice: this.giftToEdit.ticketPrice,
        description: this.giftToEdit.description,
        imageUrl: this.giftToEdit.imageUrl,
        categoryId: this.giftToEdit.categoryId
      });
    } else {
      this.form.reset();
      // הגדרת ערכי ברירת מחדל לאחר איפוס
      this.form.patchValue({ ticketPrice: 0 });
    }
  }

  // שדרוג ה-Output שישלח גם את הקובץ
  @Output() save = new EventEmitter<GiftSubmission>();



  // פונקציה לקליטת הקובץ מהרכיב
  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.handleFile(file);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.handleFile(file); // פונקציה שתטפל בקובץ (קריאה ל-FileReader)
      }
    }
  }

  // פונקציה משותפת לטיפול בקובץ (גם מלחיצה וגם מגרירה)
  private handleFile(file: File) {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // פונקציה להסרת התמונה אם רוצים:
  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  submit() {
    console.log('סטטוס הטופס:', this.form.status);
    console.log('האם הטופס תקין?', this.form.valid);
    console.log('ערכים בטופס:', this.form.value);
    console.log('שגיאות (אם יש):', this.findInvalidControls());
    if (this.form.valid) {
      // יצירת אובייקט ה-Submission שכולל את הנתונים ואת הקובץ
      const submission: GiftSubmission = {
        data: this.form.value as GiftUpsert,
        file: this.selectedFile
      };
      this.save.emit(submission);
    } else {
      this.form.markAllAsTouched();
    }
  }



  // תעדכני את ה-onFileSelect הישן שלך שישתמש ב-handleFile:


  // פונקציית עזר זמנית לניפוי שגיאות - תדביקי אותה בתוך הקלאס
  findInvalidControls() {
    // 1. הגדרת מערך ריק שיכיל את שמות השדות הבעייתיים
    const invalid: string[] = [];

    // 2. מעבר על רשימת המפתחות (שמות השדות) של ה-FormGroup
    Object.keys(this.form.controls).forEach(key => {

      // 3. שליפת ה-Control (השדה) הספציפי לפי השם שלו (key)
      const control = this.form.get(key);

      // 4. בדיקה: האם השדה קיים והאם הוא לא תקין (לפי ה-Validators שהגדרת)
      if (control && control.invalid) {
        // 5. אם השדה לא תקין, הוספת השם שלו למערך הבעיות
        invalid.push(key);
      }
    });

    // 6. החזרת רשימת השמות הלא תקינים
    return invalid;
  }



}