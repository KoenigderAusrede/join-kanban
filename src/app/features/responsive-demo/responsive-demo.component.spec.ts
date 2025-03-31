import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveDemoComponent } from './responsive-demo.component';

describe('ResponsiveDemoComponent', () => {
  let component: ResponsiveDemoComponent;
  let fixture: ComponentFixture<ResponsiveDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponsiveDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsiveDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
