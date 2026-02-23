import { Gift } from './gift';

export interface Category {
    id: number;
    name: string;
    gifts: Gift[];
}