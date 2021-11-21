import { TestBed } from '@angular/core/testing';

import { AgentMessageService } from './agent-message.service';

describe('AgentMessageService', () => {
  let service: AgentMessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentMessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
