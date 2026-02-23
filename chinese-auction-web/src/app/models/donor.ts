import { Gift } from './gift';

export interface Donor {
    id: number;
    name: string;
    email: string;
    phone: string;
    gifts: Gift[];
}

/* ========= GiftUpsert – יצירה / עדכון ========= */
export interface DonorUpsert {
  name: string;
  email: string;
  description?: string;
  phone: string;
}