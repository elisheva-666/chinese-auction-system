import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GiftGallery } from './gift-gallery';

describe('GiftGallery', () => {
  let component: GiftGallery;
  let fixture: ComponentFixture<GiftGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GiftGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GiftGallery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
