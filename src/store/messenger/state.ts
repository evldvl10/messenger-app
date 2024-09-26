import {
  MessengerDialogInterface,
  MessengerMessageInterface,
  MessengerUserStatus,
} from 'src/interfaces/messenger';

export interface MessengerStateInterface {
  dialogs: MessengerDialogInterface[];
  dialog: MessengerDialogInterface | null;
  messages: MessengerMessageInterface[];
  userStatus: MessengerUserStatus[];
}

function state(): MessengerStateInterface {
  return {
    dialogs: [],
    dialog: null,
    messages: [],
    userStatus: [],
  };
}

export default state;
