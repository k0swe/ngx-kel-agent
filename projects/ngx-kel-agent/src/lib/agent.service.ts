import {Injectable} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subject, Subscription,} from "rxjs";
import {debounceTime, delay, retryWhen, tap} from "rxjs/operators";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {
  HamlibRigState,
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
  WsjtxWsprDecode
} from "./messages";

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  /** Whether we're connected to the agent. */
  public readonly connectedState$ = new BehaviorSubject<boolean>(false);

  /*  WSJT-X  */
  /** Whether we're getting any messages from WSJT-X. */
  public readonly wsjtxState$ = new BehaviorSubject<boolean>(false);
  /** Subject for listening to WSJT-X "Heartbeat" messages. */
  public readonly wsjtxHeartbeat$ = new ReplaySubject<WsjtxHeartbeat | null>(1);
  /** Subject for listening to WSJT-X "Status" messages. */
  public readonly wsjtxStatus$ = new ReplaySubject<WsjtxStatus | null>(1);
  /** Subject for listening to WSJT-X "Decode" messages. */
  public readonly wsjtxDecode$ = new Subject<WsjtxDecode>();
  /** Subject for listening to WSJT-X "Clear" messages. */
  public readonly wsjtxClear$ = new Subject<WsjtxClear>();
  /** Subject for listening to WSJT-X "QsoLogged" messages. */
  public readonly wsjtxQsoLogged$ = new Subject<WsjtxQsoLogged>();
  /** Subject for listening to WSJT-X "Close" messages. */
  public readonly wsjtxClose$ = new Subject<WsjtxClose>();
  /** Subject for listening to WSJT-X "WsprDecode" messages. */
  public readonly wsjtxWsprDecode$ = new Subject<WsjtxWsprDecode>();
  /** Subject for listening to WSJT-X "LoggedAdif" messages. */
  public readonly wsjtxLoggedAdif$ = new Subject<WsjtxLoggedAdif>();

  /*  Hamlib  */
  /** Whether we're getting any messages from Hamlib. */
  public readonly hamlibState$ = new BehaviorSubject<boolean>(false);
  /** Subject for listening to Hamlib "RigState" messages. */
  public readonly hamlibRigState$ = new BehaviorSubject<HamlibRigState | null>(
    null
  );

  private readonly defaultAgentHost = 'localhost';
  private readonly defaultAgentPort = 8081;
  private readonly localStorageHostKey = 'agent-host';
  private readonly localStoragePortKey = 'agent-port';

  private agentHost: string = this.defaultAgentHost;
  private agentPort: number = this.defaultAgentPort;
  private agentWebSocketSubject: WebSocketSubject<object> | null = null;
  private agentWebsocketSubscription: Subscription | null = null;
  private wsjtxId: string = 'WSJT-X';

  constructor() {
  }

  public init(): void {
    this.agentHost = this.getHost();
    this.agentPort = this.getPort();
    this.setupWsjtxBehaviors();
    this.setupHamlibBehaviors();
    this.connect();
  }

  private setupWsjtxBehaviors(): void {
    // if we haven't heard from WSJT-X in 15 seconds, consider it "down"
    this.wsjtxState$
      .pipe(debounceTime(15000))
      .subscribe(() => this.wsjtxState$.next(false));
    // When WSJT-X announces it's closing, set it to "down" immediately
    this.wsjtxClose$.subscribe(() => {
      this.wsjtxState$.next(false);
    });
    // When WSJT-X goes down, clear its persistent message subjects
    this.wsjtxState$.subscribe((isUp) => {
      if (!isUp) {
        this.wsjtxHeartbeat$.next(null);
        this.wsjtxStatus$.next(null);
      }
    });
  }

  private setupHamlibBehaviors(): void {
    // if we haven't heard from Hamlib in 15 seconds, consider it down
    this.hamlibState$.pipe(debounceTime(15000)).subscribe(() => {
      this.hamlibState$.next(false);
    });
    // When Hamlib goes down, clear its persistent message subjects
    this.hamlibState$.subscribe((isUp) => {
      if (!isUp) {
        this.hamlibRigState$.next(null);
      }
    });
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
            delay(10000)
          )
        )
      )
      .subscribe({
        next: (msg) => {
          this.connectedState$.next(true);
          this.handleMessage(msg);
        },
        error: () => this.connectedState$.next(false),
        complete: () => this.connectedState$.next(false),
      });
  }

  private handleMessage(msg: any): void {
    if (msg.wsjtx != null && msg.wsjtx.type != null) {
      this.wsjtxState$.next(true);
      this.wsjtxId = msg.wsjtx.payload.id;
      switch (msg.wsjtx.type) {
        case 'HeartbeatMessage':
          this.wsjtxHeartbeat$.next(msg.wsjtx.payload as WsjtxHeartbeat);
          return;
        case 'StatusMessage':
          this.wsjtxStatus$.next(msg.wsjtx.payload as WsjtxStatus);
          return;
        case 'DecodeMessage':
          this.wsjtxDecode$.next(msg.wsjtx.payload as WsjtxDecode);
          return;
        case 'ClearMessage':
          this.wsjtxClear$.next(msg.wsjtx.payload as WsjtxClear);
          return;
        case 'QsoLoggedMessage':
          this.wsjtxQsoLogged$.next(msg.wsjtx.payload as WsjtxQsoLogged);
          return;
        case 'CloseMessage':
          this.wsjtxClose$.next(msg.wsjtx.payload as WsjtxClose);
          return;
        case 'WSPRDecodeMessage':
          this.wsjtxWsprDecode$.next(msg.wsjtx.payload as WsjtxWsprDecode);
          return;
        case 'LoggedAdifMessage':
          this.wsjtxLoggedAdif$.next(msg.wsjtx.payload as WsjtxLoggedAdif);
          return;
      }
    }
    if (msg.hamlib !== null) {
      this.hamlibState$.next(true);
      switch (msg.hamlib.type) {
        case 'RigState':
          this.hamlibRigState$.next(msg.hamlib.payload as HamlibRigState);
          return;
      }
    }
  }

  /** Get the currently configured kel-agent host. */
  public getHost(): string {
    return localStorage.getItem(this.localStorageHostKey) || this.defaultAgentHost;
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

  /** Send a command to WSJT-X to clear the Band Activity window. */
  public sendWsjtxClearBandActivity() {
    const wsMsg = {
      wsjtx: {
        type: 'ClearMessage',
        payload: <WsjtxClear>{id: this.wsjtxId, window: 0},
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to clear the Rx Frequency window. */
  public sendWsjtxClearRxFreqWindow() {
    const wsMsg = {
      wsjtx: {
        type: 'ClearMessage',
        payload: <WsjtxClear>{id: this.wsjtxId, window: 1},
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to clear the Band Activity and Rx Frequency windows. */
  public sendWsjtxClearAll() {
    const wsMsg = {
      wsjtx: {
        type: 'ClearMessage',
        payload: <WsjtxClear>{id: this.wsjtxId, window: 2},
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to replay messages. Useful for a fresh client that wants to hear
   * previous WSJT-X decodes. */
  public sendWsjtxReplay() {
    const wsMsg = {
      wsjtx: {
        type: 'ReplayMessage',
        payload: <WsjtxReplay>{id: this.wsjtxId},
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to halt any transmissions immediately. */
  public sendWsjtxHaltTxNow() {
    const wsMsg = {
      wsjtx: {
        type: 'HaltTxMessage',
        payload: <WsjtxHaltTx>{id: this.wsjtxId, autoTxOnly: false},
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to stop auto-transmitting after finishing the current round. */
  public sendWsjtxHaltTxAfterCurrent() {
    const wsMsg = {
      wsjtx: {
        type: 'HaltTxMessage',
        payload: <WsjtxHaltTx>{id: this.wsjtxId, autoTxOnly: true},
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to reply to the given decode. The message must include CQ or QRZ. */
  public sendWsjtxReply(decode: WsjtxDecode) {
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
    this.agentWebSocketSubject?.next(wsMsg);
  }

  /** Send a command to WSJT-X to reply to the given decode. The message must include CQ or QRZ. */
  public sendWsjtxHighlightCallsign(highlightMsg: WsjtxHighlightCallsign) {
    highlightMsg.id = this.wsjtxId;
    const wsMsg = {
      wsjtx: {
        type: 'HighlightCallsignMessage',
        payload: highlightMsg,
      },
    };
    this.agentWebSocketSubject?.next(wsMsg);
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
