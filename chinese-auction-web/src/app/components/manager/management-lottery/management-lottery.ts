import { Component, inject } from '@angular/core';
import { LotterySerice } from '../../../services/lottery-service';

@Component({
  selector: 'app-management-lottery',
  imports: [],
  templateUrl: './management-lottery.html',
  styleUrl: './management-lottery.scss',
})
export class ManagementLottery {

  private lotteryService = inject(LotterySerice);


  lottery(){
    this.lotteryService.drawAll().subscribe();
  }

  
}
