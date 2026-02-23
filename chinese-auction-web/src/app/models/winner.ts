import { Gift } from './gift';
import { User } from './user';

export interface Winner {
    id: number;
    giftId: number;
    gift: Gift;
    userId: number;
    user: User;
}

//פרטי המשתמש הזוכה למתנה ספיצפית - התאימה עם WinnerResultDto


export interface WinnerByGift {
    giftId: number;
    giftName: string;
    winnerUserId: number;        // ✅ אם לא int
    winnerName: string;          // ✅ string
    winnerEmail: string;         // ✅ string
    totalTickets: number;        // ✅ number בלבד
    drawDate: Date;              // ✅ Date
}

