import { AgentMessageService } from './agent-message.service';
import { BehaviorSubject, ReplaySubject, Subject, Subscription } from 'rxjs';
import { HamlibRigState } from './hamlib-messages';
import { HamlibService } from './hamlib.service';
import { Injectable } from '@angular/core';
import {
  WsjtxClear,
  WsjtxClose,
  WsjtxDecode,
  WsjtxHeartbeat,
  WsjtxHighlightCallsign,
  WsjtxLoggedAdif,
  WsjtxQsoLogged,
  WsjtxStatus,
  WsjtxWsprDecode,
} from './wsjtx-messages';
import { WsjtxService } from './wsjtx.service';
import { delay, retryWhen, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  /** Whether we're connected to the agent. */
  public readonly connectedState$ = new BehaviorSubject<boolean>(false);

  /*  WSJT-X  */
  /**
   * Whether we're getting any messages from WSJT-X.
   *
   * @deprecated Use {@link WsjtxService.connected$} instead.
   */
  public readonly wsjtxState$: BehaviorSubject<boolean>;
  /**
   * Subject for listening to WSJT-X "Heartbeat" messages.
   *
   * @deprecated Use {@link WsjtxService.heartbeat$} instead.
   */
  public readonly wsjtxHeartbeat$: ReplaySubject<WsjtxHeartbeat | null>;
  /**
   * Subject for listening to WSJT-X "Status" messages.
   *
   * @deprecated Use {@link WsjtxService.status$} instead.
   */
  public readonly wsjtxStatus$: ReplaySubject<WsjtxStatus | null>;
  /**
   * Subject for listening to WSJT-X "Decode" messages.
   *
   * @deprecated Use {@link WsjtxService.decode$} instead.
   */
  public readonly wsjtxDecode$: Subject<WsjtxDecode>;
  /**
   * Subject for listening to WSJT-X "Clear" messages.
   *
   * @deprecated Use {@link WsjtxService.clear$} instead.
   */
  public readonly wsjtxClear$: Subject<WsjtxClear>;
  /**
   * Subject for listening to WSJT-X "QsoLogged" messages.
   *
   * @deprecated Use {@link WsjtxService.qsoLogged$} instead.
   */
  public readonly wsjtxQsoLogged$: Subject<WsjtxQsoLogged>;
  /**
   * Subject for listening to WSJT-X "Close" messages.
   *
   * @deprecated Use {@link WsjtxService.close$} instead.
   */
  public readonly wsjtxClose$: Subject<WsjtxClose>;
  /**
   * Subject for listening to WSJT-X "WsprDecode" messages.
   *
   * @deprecated Use {@link WsjtxService.wsprDecode$} instead.
   */
  public readonly wsjtxWsprDecode$: Subject<WsjtxWsprDecode>;
  /**
   * Subject for listening to WSJT-X "LoggedAdif" messages.
   *
   * @deprecated Use {@link WsjtxService.loggedAdif$} instead.
   */
  public readonly wsjtxLoggedAdif$: Subject<WsjtxLoggedAdif>;

  /*  Hamlib  */
  /**
   * Whether we're getting any messages from Hamlib.
   *
   * @deprecated Use {@link HamlibService.connected$} instead.
   */
  public readonly hamlibState$: BehaviorSubject<boolean>;
  /**
   * Subject for listening to Hamlib "RigState" messages.
   *
   * @deprecated Use {@link HamlibService.rigState$} instead.
   */
  public readonly hamlibRigState$: BehaviorSubject<HamlibRigState | null>;

  private readonly defaultAgentHost = 'localhost';
  private readonly defaultAgentPort = 8081;
  private readonly localStorageHostKey = 'agent-host';
  private readonly localStoragePortKey = 'agent-port';

  private agentHost: string = this.defaultAgentHost;
  private agentPort: number = this.defaultAgentPort;
  private agentWebSocketSubject: WebSocketSubject<object> | null = null;
  private agentWebsocketSubscription: Subscription | null = null;

  constructor(
    private messages: AgentMessageService,
    private hamlibService: HamlibService,
    private wsjtxService: WsjtxService,
  ) {
    this.hamlibState$ = this.hamlibService.connected$;
    this.hamlibRigState$ = this.hamlibService.rigState$;

    this.wsjtxState$ = this.wsjtxService.connected$;
    this.wsjtxHeartbeat$ = this.wsjtxService.heartbeat$;
    this.wsjtxStatus$ = this.wsjtxService.status$;
    this.wsjtxDecode$ = this.wsjtxService.decode$;
    this.wsjtxClear$ = this.wsjtxService.clear$;
    this.wsjtxQsoLogged$ = this.wsjtxService.qsoLogged$;
    this.wsjtxClose$ = this.wsjtxService.close$;
    this.wsjtxWsprDecode$ = this.wsjtxService.wsprDecode$;
    this.wsjtxLoggedAdif$ = this.wsjtxService.loggedAdif$;
  }

  public init(): void {
    this.messages.txMessage$.subscribe((msg) => this.send(msg));
    this.agentHost = this.getHost();
    this.agentPort = this.getPort();
    this.connect();
  }

  /** Connect (or reconnect) the websocket to the kel-agent server. */
  public connect(): void {
    if (this.agentWebsocketSubscription) {
      this.agentWebsocketSubscription.unsubscribe();
    }
    this.agentHost = this.getHost();
    this.agentPort = this.getPort();
    const protocol = this.agentHost === 'localhost' ? 'ws://' : 'wss://';
    this.agentWebSocketSubject = webSocket<object>({
      url: protocol + this.agentHost + ':' + this.agentPort + '/websocket',
    });
    this.connectedState$.next(true);
    this.agentWebsocketSubscription = this.agentWebSocketSubject
      .pipe(
        retryWhen((errors) =>
          // retry the websocket connection after 10 seconds
          errors.pipe(
            tap(() => this.connectedState$.next(false)),
            delay(10000),
          ),
        ),
      )
      .subscribe({
        next: (msg) => {
          this.connectedState$.next(true);
          this.messages.rxMessage$.next(msg);
        },
        error: () => this.connectedState$.next(false),
        complete: () => this.connectedState$.next(false),
      });
  }

  /** Get the currently configured kel-agent host. */
  public getHost(): string {
    return (
      localStorage.getItem(this.localStorageHostKey) || this.defaultAgentHost
    );
  }

  /** Get the currently configured kel-agent port. */
  public getPort(): number {
    let portStr = localStorage.getItem(this.localStoragePortKey);
    if (portStr == null) {
      return this.defaultAgentPort;
    }
    let portNum = parseInt(portStr, 10);
    if (isNaN(portNum)) {
      return this.defaultAgentPort;
    }
    return portNum;
  }

  /** Set the kel-agent host. */
  public setHost(host: string): void {
    localStorage.setItem(this.localStorageHostKey, host);
    this.connect();
  }

  /** Set the kel-agent port. */
  public setPort(port: number): void {
    localStorage.setItem(this.localStoragePortKey, String(port));
    this.connect();
  }

  private send(wsMsg: any) {
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /**
   * Send a command to WSJT-X to clear the Band Activity window.
   *
   * @deprecated Use {@link WsjtxService.clearBandActivity} instead.
   */
  public sendWsjtxClearBandActivity() {
    this.wsjtxService.clearBandActivity();
  }

  /**
   * Send a command to WSJT-X to clear the Rx Frequency window.
   *
   * @deprecated Use {@link WsjtxService.clearRxFreqWindow} instead.
   */
  public sendWsjtxClearRxFreqWindow() {
    this.wsjtxService.clearRxFreqWindow();
  }

  /**
   * Send a command to WSJT-X to clear the Band Activity and Rx Frequency windows.
   *
   * @deprecated Use {@link WsjtxService.clearAll} instead.
   */
  public sendWsjtxClearAll() {
    this.wsjtxService.clearAll();
  }

  /**
   * Send a command to WSJT-X to replay messages. Useful for a fresh client that wants to hear
   * previous WSJT-X decodes.
   *
   * @deprecated Use {@link WsjtxService.replay} instead.
   */
  public sendWsjtxReplay() {
    this.wsjtxService.replay();
  }

  /**
   * Send a command to WSJT-X to halt any transmissions immediately.
   *
   * @deprecated Use {@link WsjtxService.haltTxNow} instead.
   */
  public sendWsjtxHaltTxNow() {
    this.wsjtxService.haltTxNow();
  }

  /** Send a command to WSJT-X to stop auto-transmitting after finishing the current round.
   *
   * @deprecated Use {@link WsjtxService.haltTxAfterCurrent} instead.
   */
  public sendWsjtxHaltTxAfterCurrent() {
    this.wsjtxService.haltTxAfterCurrent();
  }

  /**
   * Send a command to WSJT-X to reply to the given decode. The message must include CQ or QRZ.
   *
   * @deprecated Use {@link WsjtxService.reply} instead.
   */
  public sendWsjtxReply(decode: WsjtxDecode) {
    this.wsjtxService.reply(decode);
  }

  /**
   * Send a command to WSJT-X to reply to the given decode. The message must include CQ or QRZ.
   *
   * @deprecated Use {@link WsjtxService.highlightCallsign} instead.
   */
  public sendWsjtxHighlightCallsign(highlightMsg: WsjtxHighlightCallsign) {
    this.wsjtxService.highlightCallsign(highlightMsg);
  }

  /**
   * Given a decode message, format a string the same way as displayed in the WSJT-X Band
   * Activity/Rx Frequency windows.
   *
   * @deprecated Use {@link WsjtxService.formatDecode} instead.
   */
  public static formatDecode(msg: WsjtxDecode): string {
    return WsjtxService.formatDecode(msg);
  }
}
