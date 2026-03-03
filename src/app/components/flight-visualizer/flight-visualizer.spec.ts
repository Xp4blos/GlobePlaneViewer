import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightVisualizer } from './flight-visualizer';

describe('FlightVisualizer', () => {
  let component: FlightVisualizer;
  let fixture: ComponentFixture<FlightVisualizer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlightVisualizer],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightVisualizer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
