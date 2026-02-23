import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagementDonor } from './management-donor';

describe('ManagementDonor', () => {
  let component: ManagementDonor;
  let fixture: ComponentFixture<ManagementDonor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagementDonor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagementDonor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
