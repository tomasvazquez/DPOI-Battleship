import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WarmingComponent } from './warming.component';

describe('WarmingComponent', () => {
  let component: WarmingComponent;
  let fixture: ComponentFixture<WarmingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WarmingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WarmingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
