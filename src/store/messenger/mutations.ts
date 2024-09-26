import { MutationTree } from 'vuex';
import { MessengerStateInterface } from './state';
import { socket } from 'src/boot/socket.io';

import { SocketInitInterface } from 'src/interfaces/socket';

import {
  MessengerDialogInterface,
  MessengerMessageInterface,
  MessengerDialogMessagesInterface,
  MessengerUserStatus,
} from 'src/interfaces/messenger';

const mutation: MutationTree<MessengerStateInterface> = {
  dialogs(state: MessengerStateInterface, payload: MessengerDialogInterface) {
    state.dialogs = state.dialogs.concat([payload]);
  },
  messages(state: MessengerStateInterface, payload: MessengerMessageInterface) {
    state.messages = state.messages.concat([payload]);
  },
  SOCKET_init(state: MessengerStateInterface, payload: SocketInitInterface) {
    payload.dialogs.sort((a, b) =>
      a.message.created > b.message.created
        ? 1
        : b.message.created > a.message.created
        ? -1
        : 0
    );
    state.dialogs = payload.dialogs.reverse();
    state.userStatus = payload.userStatus;
  },
  SOCKET_messenger_dialog_messages(
    state: MessengerStateInterface,
    payload: MessengerDialogMessagesInterface
  ) {
    state.dialog = payload.details;
    state.messages = payload.messages;
    socket.emit('messenger_dialog_list');
  },
  SOCKET_messenger_dialog_list(
    state: MessengerStateInterface,
    payload: MessengerDialogInterface[]
  ) {
    payload.sort((a, b) =>
      a.message.created > b.message.created
        ? 1
        : b.message.created > a.message.created
        ? -1
        : 0
    );
    state.dialogs = payload.reverse();
  },
  SOCKET_messenger_user_status(
    state: MessengerStateInterface,
    payload: MessengerUserStatus[]
  ) {
    state.userStatus = payload;
    setTimeout(() => {
      socket.emit('messenger_user_status');
    }, 10000);
  },
};

export default mutation;
