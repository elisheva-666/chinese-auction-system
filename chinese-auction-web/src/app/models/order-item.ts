import { Gift } from './gift';
import { Order } from './order';

export interface OrderItem {
    id: number;
    giftId: number;
    gift: Gift;
    orderId: number;
    order: Order;
    quantity: number;
}