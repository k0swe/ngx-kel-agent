import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { AgentMessageService } from './agent-message.service';

describe('AgentMessageService', () => {
  let service: AgentMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(AgentMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
