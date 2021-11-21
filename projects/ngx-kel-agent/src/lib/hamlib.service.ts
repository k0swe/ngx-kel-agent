import { Injectable } from '@angular/core';
import { AgentService } from './agent.service';
import { BehaviorSubject } from 'rxjs';
import { HamlibRigState } from './hamlib-messages';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HamlibService {
  /** Whether we're getting any messages from Hamlib. */
  public readonly connected$ = new BehaviorSubject<boolean>(false);
  /** Subject for listening to Hamlib "RigState" messages. */
  public readonly rigState$ = new BehaviorSubject<HamlibRigState | null>(null);

  constructor(private agentService: AgentService) {}

  setupBehaviors(): void {
    // if we haven't heard from Hamlib in 15 seconds, consider it down
    this.connected$.pipe(debounceTime(15000)).subscribe(() => {
      this.connected$.next(false);
    });
    // When Hamlib goes down, clear its persistent message subjects
    this.connected$.subscribe((isUp) => {
      if (!isUp) {
        this.rigState$.next(null);
      }
    });
  }

  handleMessage(msg: any): void {
    this.connected$.next(true);
    switch (msg.hamlib.type) {
      case 'RigState':
        this.rigState$.next(msg.hamlib.payload as HamlibRigState);
        return;
    }
  }
}
