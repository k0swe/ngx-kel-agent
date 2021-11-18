/**
 * The heartbeat  message shall be  sent on a periodic  basis every
 *    15   seconds.  This
 *    message is intended to be used by servers to detect the presence
 *    of a  client and also  the unexpected disappearance of  a client
 *    and  by clients  to learn  the schema  negotiated by  the server
 *    after it receives  the initial heartbeat message  from a client.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l110).
 */
export interface WsjtxHeartbeat {
  /** WSJT-X client name */
  id: string;
  /** WSJT-X client's supported schema version */
  maxSchemaVersion: number;
  /** WSJT-X client's commit hash */
  revision: string;
  /** WSJT-X client's semantic version */
  version: string;
}

/**
 * WSJT-X  sends this  status message  when various  internal state
 * changes to allow the server to  track the relevant state of each
 * client without the need for  polling commands.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l141).
 */
export interface WsjtxStatus {
  configName: string;
  /** Local station's callsign */
  deCall: string;
  /** Local station's Maidenhead grid */
  deGrid: string;
  /** Whether WSJT-X is currently decoding */
  decoding: boolean;
  /** The connected transceiver's dial frequency in hertz */
  dialFrequency: number;
  /** Remote station's callsign */
  dxCall: string;
  /** Remote station's Maidenhead grid */
  dxGrid: string;
  fastMode: boolean;
  frequencyTolerance: number;
  /** WSJT-X client name */
  id: string;
  /** The receive protocol that WSJT-X is decoding */
  mode: string;
  /** The local station's signal report for the remote station */
  report: string;
  /** The listening frequency in hertz above the dial frequency */
  rxDeltaFreq: number;
  /** If non-zero, WSJT-X is in a special mode like Fox/Hound or Field Day */
  specialMode: number;
  submode: string;
  /** Whether WSJT-X is transmitting */
  transmitting: boolean;
  /** The transmit frequency in hertz above the dial frequency */
  txDeltaFreq: number;
  /** Whether WSJT-X is allowed to transmit during the next window */
  txEnabled: boolean;
  txMode: string;
  txRxPeriod: number;
  txWatchdog: boolean;
  /** The message being transmitted */
  txMessage: string;
}

/**
 * The decode message is sent when  a new decode is completed, in
 * this case the 'New' field is true. It is also used in response
 * to  a "Replay"  message where  each  old decode  in the  "Band
 * activity" window, that  has not been erased, is  sent in order
 * as a one of these messages  with the 'New' field set to false.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l208).
 */
export interface WsjtxDecode {
  /** The decode's frequency in hertz above the dial frequency */
  deltaFrequency: number;
  /** The perceived clock differential between the local station and remote station, in seconds. */
  deltaTime: number;
  /** WSJT-X client name */
  id: string;
  lowConfidence: boolean;
  /** The message payload contained in the decode */
  message: string;
  /** The protocol of the decoded message */
  mode: string;
  /** Whether the decode is new or replayed */
  new: boolean;
  /** Whether the decode came from playback of a recording */
  offAir: boolean;
  /** Local station's perceived signal to noise ratio */
  snr: number;
  /** Clock time in milliseconds since midnight */
  time: number;
}

/**
 * This message is  send when all prior "Decode"  messages in the
 * "Band Activity"  window have been discarded  and therefore are
 * no long available for actioning  with a "Reply" message.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l234).
 */
export interface WsjtxClear {
  /** WSJT-X client name */
  id: string;
  /** Which window to clear (send only). Send 0 to clear Band Activity, 1 to clear Rx Frequency, */
  /** or 2 to clear both. */
  window: number;
}

/**
 * The QSO logged message is sent when the WSJT-X user accepts the "Log  QSO" dialog by clicking
 * the "OK" button.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l295).
 */
export interface WsjtxQsoLogged {
  comments: string;
  dateTimeOff: Date;
  dateTimeOn: Date;
  /** remote station's callsign */
  dxCall: string;
  /** remote station's Maidenhead grid */
  dxGrid: string;
  /** contest exchange received */
  exchangeReceived: string;
  /** contest exchange sent */
  exchangeSent: string;
  mode: string;
  /** local station's callsign */
  myCall: string;
  /** local station's Maidenhead grid */
  myGrid: string;
  /** remote station's operator's name */
  name: string;
  /** remote stations operator's callsign (if different from station) */
  operatorCall: string;
  /** signal report received */
  reportReceived: string;
  /** signal report sent */
  reportSent: string;
  /** frequency in hertz */
  txFrequency: number;
  /** power in watts */
  txPower: string;
  /** WSJT-X client name */
  id: string;
}

/**
 * Close is  sent by  a client immediately  prior to  it shutting
 * down gracefully.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l320).
 */
export interface WsjtxClose {
  /** WSJT-X client name */
  id: string;
}

/**
 * When a server starts it may  be useful for it to determine the
 * state  of preexisting  clients. Sending  this message  to each
 * client as it is discovered  will cause that client (WSJT-X) to
 * send a "Decode" message for each decode currently in its "Band
 * activity"  window. Each  "Decode" message  sent will  have the
 * "New" flag set to false so that they can be distinguished from
 * new decodes. After  all the old decodes have  been broadcast a
 * "Status" message  is also broadcast.  If the server  wishes to
 * determine  the  status  of  a newly  discovered  client;  this
 * message should be used.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l328).
 */
export interface WsjtxReplay {
  /** WSJT-X client name */
  id: string;
}

/**
 * The server may stop a client from transmitting messages either
 * immediately or at  the end of the  current transmission period
 * using this message.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l343).
 */
export interface WsjtxHaltTx {
  /** WSJT-X client name */
  id: string;
  /** If `false`, stop the ongoing transmission immediately. If `true`, this doesn't halt the
   * current transmission, it just disables WSJT-X from transmitting after the current round. */
  autoTxOnly: boolean;
}

/**
 * The decode message is sent when  a new decode is completed, in
 * this case the 'New' field is true.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l383).
 */
export interface WsjtxWsprDecode {
  /** WSJT-X client name */
  id: string;
  /** Whether the decode is new or replayed */
  new: boolean;
  /** Clock time in milliseconds since midnight */
  time: number;
  /** Local station's perceived signal to noise ratio */
  snr: number;
  /** The perceived clock differential between the local station and remote station, in seconds. */
  deltaTime: number;
  frequency: number;
  drift: number;
  /** remote station's callsign */
  callsign: string;
  /** remote station's Maidenhead grid */
  grid: string;
  /** power in dBm */
  power: number;
  /** whether the decode came from playback of a recording */
  offAir: boolean;
}

/**
 * The  logged ADIF  message is  sent to  the server(s)  when the
 * WSJT-X user accepts the "Log  QSO" dialog by clicking the "OK"
 * button.
 *
 * See
 * [WSJT-X source](https://sourceforge.net/p/wsjt/wsjtx/ci/wsjtx-2.5.2/tree/Network/NetworkMessage.hpp#l423).
 */
export interface WsjtxLoggedAdif {
  /** WSJT-X client name */
  id: string;
  /** ADIF encoded QSO data */
  adif: string;
}

export interface HamlibRigState {
  /** Transceiver model name */
  model: string;
  /** Dial frequency of the "current" VFO in Hz */
  frequency: number;
  /** Mode name of the "current" VFO */
  mode: string;
  /** Width of the current passband filter in Hz */
  passbandWidthHz: number;
}
