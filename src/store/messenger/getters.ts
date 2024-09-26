import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { MessengerStateInterface } from './state';

import {
  MessengerDialogInterface,
  MessengerUserStatus,
  MessengerMessageInterface,
} from 'src/interfaces/messenger';

const getters: GetterTree<MessengerStateInterface, StateInterface> = {
  dialogs(state: MessengerStateInterface): MessengerDialogInterface[] {
    return state.dialogs;
  },
  dialog(state: MessengerStateInterface): MessengerDialogInterface | null {
    return state.dialog;
  },
  messages(state: MessengerStateInterface): MessengerMessageInterface[] {
    return state.messages;
  },
  userStatus(state: MessengerStateInterface): MessengerUserStatus[] {
    return state.userStatus;
  },
};

export default getters;
