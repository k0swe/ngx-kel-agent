import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import type { HamlibRigState } from './hamlib-messages';
import type {
  WsjtxClear,
  WsjtxClose,
  WsjtxConfigure,
  WsjtxDecode,
  WsjtxFreeText,
  WsjtxHaltTx,
  WsjtxHeartbeat,
  WsjtxHighlightCallsign,
  WsjtxLocation,
  WsjtxLoggedAdif,
  WsjtxQsoLogged,
  WsjtxReplay,
  WsjtxReply,
  WsjtxStatus,
  WsjtxSwitchConfiguration,
  WsjtxWsprDecode,
} from './wsjtx-messages';

export interface AgentProtocolMessage<
  TType extends string = string,
  TPayload = unknown,
> {
  type: TType;
  payload: TPayload;
}

export type WsjtxIncomingMessageType =
  | 'HeartbeatMessage'
  | 'StatusMessage'
  | 'DecodeMessage'
  | 'ClearMessage'
  | 'QsoLoggedMessage'
  | 'CloseMessage'
  | 'WSPRDecodeMessage'
  | 'LoggedAdifMessage';

export type WsjtxOutgoingMessageType =
  | 'ClearMessage'
  | 'ReplayMessage'
  | 'HaltTxMessage'
  | 'ReplyMessage'
  | 'HighlightCallsignMessage'
  | 'FreeTextMessage'
  | 'LocationMessage'
  | 'SwitchConfigurationMessage'
  | 'ConfigureMessage';

export type WsjtxIncomingPayload =
  | WsjtxHeartbeat
  | WsjtxStatus
  | WsjtxDecode
  | WsjtxClear
  | WsjtxQsoLogged
  | WsjtxClose
  | WsjtxWsprDecode
  | WsjtxLoggedAdif;

export type WsjtxOutgoingPayload =
  | WsjtxClear
  | WsjtxReplay
  | WsjtxHaltTx
  | WsjtxReply
  | WsjtxHighlightCallsign
  | WsjtxFreeText
  | WsjtxLocation
  | WsjtxSwitchConfiguration
  | WsjtxConfigure;

export type HamlibIncomingMessageType = 'RigState';
export type HamlibIncomingPayload = HamlibRigState;

export interface AgentIncomingMessage {
  wsjtx?: AgentProtocolMessage<WsjtxIncomingMessageType, WsjtxIncomingPayload>;
  hamlib?: AgentProtocolMessage<
    HamlibIncomingMessageType,
    HamlibIncomingPayload
  >;
  [key: string]: unknown;
}

export interface AgentOutgoingMessage {
  wsjtx?: AgentProtocolMessage<WsjtxOutgoingMessageType, WsjtxOutgoingPayload>;
  [key: string]: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class AgentMessageService {
  readonly rxMessage$ = new Subject<AgentIncomingMessage>();
  readonly txMessage$ = new Subject<AgentOutgoingMessage>();
}
