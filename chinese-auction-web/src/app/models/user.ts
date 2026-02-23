import { Order } from './order';

export enum Role {
    Admin = 'Admin',
    Purchaser = 'Purchaser'
}

export interface User {
    id: number;
    name: string;
    email: string;
    passwordHash: string;
    phone: string;
    role: Role;
    orders: Order[];
}

export interface LoginResponse {
  token: string;      // ה-JSON בדרך כלל הופך לאותיות קטנות בצד לקוח
  tokenType: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}