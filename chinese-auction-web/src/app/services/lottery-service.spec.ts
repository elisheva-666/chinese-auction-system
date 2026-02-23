import { TestBed } from '@angular/core/testing';

import { LotterySerice } from './lottery-service';

describe('LotterySerice', () => {
  let service: LotterySerice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LotterySerice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
