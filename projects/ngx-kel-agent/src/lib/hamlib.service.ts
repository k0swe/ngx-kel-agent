import { Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';
import { HamlibRigState } from './hamlib-messages';
import { debounceTime, filter } from 'rxjs/operators';
import { AgentMessageService } from './agent-message.service';

@Injectable({
  providedIn: 'root',
})
export class HamlibService {
  /** Whether we're getting any messages from Hamlib. */
  public readonly connected$ = new BehaviorSubject<boolean>(false);
  /** Signal indicating whether we're getting any messages from Hamlib. */
  public readonly connected: Signal<boolean>;

  /** Subject for listening to Hamlib "RigState" messages. */
  public readonly rigState$ = new BehaviorSubject<HamlibRigState | null>(null);
  /** Signal for the latest Hamlib "RigState" message. */
  public readonly rigState: Signal<HamlibRigState | null>;

  constructor(private messages: AgentMessageService) {
    this.connected = toSignal(this.connected$, { requireSync: true });
    this.rigState = toSignal(this.rigState$, { requireSync: true });
    this.setupBehaviors();
  }

  setupBehaviors(): void {
    this.messages.rxMessage$.subscribe((msg) => this.handleMessage(msg));
    // if we haven't heard from Hamlib in 15 seconds, consider it down
    this.connected$
      .pipe(
        filter((isUp) => isUp),
        debounceTime(15000),
      )
      .subscribe(() => {
        this.connected$.next(false);
      });
    // When Hamlib goes down, clear its persistent message subjects
    this.connected$.subscribe((isUp) => {
      if (!isUp) {
        this.rigState$.next(null);
      }
    });
  }

  private handleMessage(msg: any): void {
    if (!msg.hamlib || !msg.hamlib.type) {
      return;
    }
    this.connected$.next(true);
    switch (msg.hamlib.type) {
      case 'RigState':
        this.rigState$.next(msg.hamlib.payload as HamlibRigState);
        return;
    }
  }
}
