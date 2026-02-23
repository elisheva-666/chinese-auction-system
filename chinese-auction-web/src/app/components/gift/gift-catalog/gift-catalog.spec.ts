import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftCatalog } from './gift-catalog';

describe('GiftCatalog', () => {
  let component: GiftCatalog;
  let fixture: ComponentFixture<GiftCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftCatalog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
