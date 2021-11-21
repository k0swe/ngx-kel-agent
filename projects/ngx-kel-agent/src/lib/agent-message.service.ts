import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentMessageService {
  rxMessage$ = new Subject<any>();
  txMessage$ = new Subject<any>();

  constructor() {}
}
