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

  it('connected signal should start false', () => {
    expect(service.connected()).toBeFalse();
  });

  it('heartbeat signal should start null', () => {
    expect(service.heartbeat()).toBeNull();
  });

  it('status signal should start null', () => {
    expect(service.status()).toBeNull();
  });

  it('decode signal should start null', () => {
    expect(service.decode()).toBeNull();
  });

  it('clear signal should start null', () => {
    expect(service.clear()).toBeNull();
  });

  it('qsoLogged signal should start null', () => {
    expect(service.qsoLogged()).toBeNull();
  });

  it('close signal should start null', () => {
    expect(service.close()).toBeNull();
  });

  it('wsprDecode signal should start null', () => {
    expect(service.wsprDecode()).toBeNull();
  });

  it('loggedAdif signal should start null', () => {
    expect(service.loggedAdif()).toBeNull();
  });
});
