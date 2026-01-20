import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { WsjtxService } from './wsjtx.service';

describe('WsjtxService', () => {
  let service: WsjtxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(WsjtxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
