


/* ========= Gift – תצוגה ========= */
export interface Gift {
  id: number;
  name: string;
  ticketPrice: number;

  description?: string;
  imageUrl?: string;

  categoryId?: number;
  categoryName: string;

  donorName?: string;
  
  // פרטי הגרלה
  isDrawn?: boolean;
  winnerName?: string;
}

/* ========= GiftUpsert – יצירה / עדכון ========= */
export interface GiftUpsert {
  name: string;
  ticketPrice: number;
  description?: string;
  // imageUrl?: string;
  categoryId: number;
}

/* ========= Dropdowns ========= */
export interface Category {
  id: number;
  name: string;
}

export interface Donor {
  id: number;
  name: string;
}

/* ========= יצירת מתנה ========= */
export interface GiftSubmission {
    data: GiftUpsert;
    file: File | null;
}

