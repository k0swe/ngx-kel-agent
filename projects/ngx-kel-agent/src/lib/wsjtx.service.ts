import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import {
  WsjtxClear,
  WsjtxClose,
  WsjtxDecode,
  WsjtxHaltTx,
  WsjtxHeartbeat,
  WsjtxHighlightCallsign,
  WsjtxLoggedAdif,
  WsjtxQsoLogged,
  WsjtxReplay,
  WsjtxReply,
  WsjtxStatus,
  WsjtxWsprDecode,
} from './wsjtx-messages';
import { debounceTime } from 'rxjs/operators';
import { AgentMessageService } from './agent-message.service';

@Injectable({
  providedIn: 'root',
})
export class WsjtxService {
  /** Whether we're getting any messages from WSJT-X. */
  public readonly connected$ = new BehaviorSubject<boolean>(false);
  /** Subject for listening to WSJT-X "Heartbeat" messages. */
  public readonly heartbeat$ = new ReplaySubject<WsjtxHeartbeat | null>(1);
  /** Subject for listening to WSJT-X "Status" messages. */
  public readonly status$ = new ReplaySubject<WsjtxStatus | null>(1);
  /** Subject for listening to WSJT-X "Decode" messages. */
  public readonly decode$ = new Subject<WsjtxDecode>();
  /** Subject for listening to WSJT-X "Clear" messages. */
  public readonly clear$ = new Subject<WsjtxClear>();
  /** Subject for listening to WSJT-X "QsoLogged" messages. */
  public readonly qsoLogged$ = new Subject<WsjtxQsoLogged>();
  /** Subject for listening to WSJT-X "Close" messages. */
  public readonly close$ = new Subject<WsjtxClose>();
  /** Subject for listening to WSJT-X "WsprDecode" messages. */
  public readonly wsprDecode$ = new Subject<WsjtxWsprDecode>();
  /** Subject for listening to WSJT-X "LoggedAdif" messages. */
  public readonly loggedAdif$ = new Subject<WsjtxLoggedAdif>();

  private wsjtxId: string = 'WSJT-X';

  constructor(private messages: AgentMessageService) {
    this.setupBehaviors();
  }

  setupBehaviors(): void {
    this.messages.rxMessage$.subscribe((msg) => this.handleMessage(msg));
    // if we haven't heard from WSJT-X in 15 seconds, consider it "down"
    this.connected$
      .pipe(debounceTime(15000))
      .subscribe(() => this.connected$.next(false));
    // When WSJT-X announces it's closing, set it to "down" immediately
    this.close$.subscribe(() => {
      this.connected$.next(false);
    });
    // When WSJT-X goes down, clear its persistent message subjects
    this.connected$.subscribe((isUp) => {
      if (!isUp) {
        this.heartbeat$.next(null);
        this.status$.next(null);
      }
    });
  }

  private handleMessage(msg: any): void {
    if (!msg.wsjtx) {
      return;
    }
    this.connected$.next(true);
    this.wsjtxId = msg.wsjtx.payload.id;
    switch (msg.wsjtx.type) {
      case 'HeartbeatMessage':
        this.heartbeat$.next(msg.wsjtx.payload as WsjtxHeartbeat);
        return;
      case 'StatusMessage':
        this.status$.next(msg.wsjtx.payload as WsjtxStatus);
        return;
      case 'DecodeMessage':
        this.decode$.next(msg.wsjtx.payload as WsjtxDecode);
        return;
      case 'ClearMessage':
        this.clear$.next(msg.wsjtx.payload as WsjtxClear);
        return;
      case 'QsoLoggedMessage':
        this.qsoLogged$.next(msg.wsjtx.payload as WsjtxQsoLogged);
        return;
      case 'CloseMessage':
        this.close$.next(msg.wsjtx.payload as WsjtxClose);
        return;
      case 'WSPRDecodeMessage':
        this.wsprDecode$.next(msg.wsjtx.payload as WsjtxWsprDecode);
        return;
      case 'LoggedAdifMessage':
        this.loggedAdif$.next(msg.wsjtx.payload as WsjtxLoggedAdif);
        return;
    }
  }

  /** Send a command to WSJT-X to clear the Band Activity window. */
  public clearBandActivity() {
    const wsMsg = {
      wsjtx: {
        type: 'ClearMessage',
        payload: <WsjtxClear>{ id: this.wsjtxId, window: 0 },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to clear the Rx Frequency window. */
  public clearRxFreqWindow() {
    const wsMsg = {
      wsjtx: {
        type: 'ClearMessage',
        payload: <WsjtxClear>{ id: this.wsjtxId, window: 1 },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to clear the Band Activity and Rx Frequency windows. */
  public clearAll() {
    const wsMsg = {
      wsjtx: {
        type: 'ClearMessage',
        payload: <WsjtxClear>{ id: this.wsjtxId, window: 2 },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to replay messages. Useful for a fresh client that wants to hear
   * previous WSJT-X decodes. */
  public replay() {
    const wsMsg = {
      wsjtx: {
        type: 'ReplayMessage',
        payload: <WsjtxReplay>{ id: this.wsjtxId },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to halt any transmissions immediately. */
  public haltTxNow() {
    const wsMsg = {
      wsjtx: {
        type: 'HaltTxMessage',
        payload: <WsjtxHaltTx>{ id: this.wsjtxId, autoTxOnly: false },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to stop auto-transmitting after finishing the current round. */
  public haltTxAfterCurrent() {
    const wsMsg = {
      wsjtx: {
        type: 'HaltTxMessage',
        payload: <WsjtxHaltTx>{ id: this.wsjtxId, autoTxOnly: true },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to reply to the given decode. The message must include CQ or QRZ. */
  public reply(decode: WsjtxDecode) {
    const wsMsg = {
      wsjtx: {
        type: 'ReplyMessage',
        payload: <WsjtxReply>{
          id: decode.id,
          time: decode.time,
          snr: decode.snr,
          deltaTime: decode.deltaTime,
          deltaFrequency: decode.deltaFrequency,
          mode: decode.mode,
          message: decode.message,
          lowConfidence: decode.lowConfidence,
        },
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Send a command to WSJT-X to reply to the given decode. The message must include CQ or QRZ. */
  public highlightCallsign(highlightMsg: WsjtxHighlightCallsign) {
    highlightMsg.id = this.wsjtxId;
    const wsMsg = {
      wsjtx: {
        type: 'HighlightCallsignMessage',
        payload: highlightMsg,
      },
    };
    this.messages.txMessage$.next(wsMsg);
  }

  /** Given a decode message, format a string the same way as displayed in the WSJT-X Band
   * Activity/Rx Frequency windows. */
  public static formatDecode(msg: WsjtxDecode): string {
    const secondsSinceMidnight = Math.floor(msg.time / 1000);
    const hours = Math.floor(secondsSinceMidnight / 3600);
    const secondsSinceHour = secondsSinceMidnight - hours * 3600;
    const minutes = Math.floor(secondsSinceHour / 60);
    const seconds = secondsSinceHour - minutes * 60;
    const timeStr = `${hours.toString().padStart(2, '0')}${minutes
      .toString()
      .padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;

    return `${timeStr} ${msg.snr.toString().padStart(3)} ${msg.deltaTime
      .toFixed(1)
      .padStart(4)} ${msg.deltaFrequency.toString().padStart(4)} ~  ${
      msg.message
    }`;
  }
}
