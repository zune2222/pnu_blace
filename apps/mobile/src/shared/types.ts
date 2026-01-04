export type BridgeMessageType = 
  | 'REQUEST_PUSH_TOKEN'
  | 'REGISTER_PUSH_TOKEN'
  | 'LOGIN_SUCCESS'
  | 'SET_USER_TOKEN'
  | 'LOGOUT'
  | 'OPEN_EXTERNAL_URL'
  | 'THEME_CHANGE';

export interface BridgeMessage {
  type: BridgeMessageType;
  payload?: any;
}
