import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { HamlibService } from './hamlib.service';

describe('HamlibService', () => {
  let service: HamlibService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(HamlibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
