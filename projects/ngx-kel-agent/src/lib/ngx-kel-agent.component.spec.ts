import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxKelAgentComponent } from './ngx-kel-agent.component';

describe('NgxKelAgentComponent', () => {
  let component: NgxKelAgentComponent;
  let fixture: ComponentFixture<NgxKelAgentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxKelAgentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxKelAgentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
