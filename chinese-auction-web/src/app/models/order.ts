import { User } from './user';
import { OrderItem } from './order-item';

export enum Status {
    IsDraft = 'IsDraft',
    IsConfirmed = 'IsConfirmed'
}

export interface Order {
    id: number;
    orderDate: Date;
    status: Status;
    totalAmount: number;
    userId: number;
    user: User;
    orderItems: OrderItem[];
}

export interface OrderItemCreateDto {
  giftId: number;
  quantity: number;
}


export interface OrderItemResponseDto {
    id: number;        // <--- חובה להוסיף את זה! (זה ה-OrderItemId למחיקה)
    giftId: number;
    giftName: string;
    quantity: number;
    unitPrice: number;
}

export interface OrderResponseDto {
    id: number;          // חובה: מזהה ההזמנה
    userId: number;
    orderDate: Date;
    totalAmount: number;
    orderItems: OrderItemResponseDto[];
}

