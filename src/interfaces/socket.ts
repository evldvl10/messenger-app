import {
  MessengerDialogInterface,
  MessengerUserStatus,
} from 'src/interfaces/messenger';

export interface SocketInitInterface {
  dialogs: MessengerDialogInterface[];
  userStatus: MessengerUserStatus[];
}
