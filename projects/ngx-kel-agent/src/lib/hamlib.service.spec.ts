import { TestBed } from '@angular/core/testing';

import { HamlibService } from './hamlib.service';

describe('HamlibService', () => {
  let service: HamlibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HamlibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
