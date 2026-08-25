import { DestroyRef, Injectable, Signal, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, filter } from 'rxjs';
import { HamlibRigState } from './hamlib-messages';
import {
  AgentIncomingMessage,
  AgentMessageService,
} from './agent-message.service';

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

  private readonly destroyRef = inject(DestroyRef);
  private readonly messages = inject(AgentMessageService);

  constructor() {
    this.connected = toSignal(this.connected$, { requireSync: true });
    this.rigState = toSignal(this.rigState$, { requireSync: true });
    this.setupBehaviors();
  }

  private setupBehaviors(): void {
    this.messages.rxMessage$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((msg) => this.handleMessage(msg));
    // if we haven't heard from Hamlib in 15 seconds, consider it down
    this.connected$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter((isUp) => isUp),
        debounceTime(15000),
      )
      .subscribe(() => {
        this.connected$.next(false);
      });
    // When Hamlib goes down, clear its persistent message subjects
    this.connected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isUp) => {
      if (!isUp) {
        this.rigState$.next(null);
      }
      });
  }

  private handleMessage(msg: AgentIncomingMessage): void {
    if (!msg.hamlib || msg.hamlib.type !== 'RigState') {
      return;
    }
    this.connected$.next(true);
    this.rigState$.next(msg.hamlib.payload as HamlibRigState);
  }
}
