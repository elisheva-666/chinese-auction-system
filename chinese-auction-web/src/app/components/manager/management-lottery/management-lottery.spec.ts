import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementLottery } from './management-lottery';

describe('ManagementLottery', () => {
  let component: ManagementLottery;
  let fixture: ComponentFixture<ManagementLottery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementLottery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementLottery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
