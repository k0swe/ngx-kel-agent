import { TestBed } from '@angular/core/testing';

import { WsjtxService } from './wsjtx.service';

describe('WsjtxService', () => {
  let service: WsjtxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WsjtxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
