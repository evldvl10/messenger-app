import { Notify } from 'quasar';
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { MessengerStateInterface } from './state';
import { socket } from 'src/boot/socket.io';

import {
  RouteLocationAsRelativeGeneric,
  RouteLocationAsPathGeneric,
} from 'vue-router';

import {
  MessengerMessageInterface,
  MessengerDialogInterface,
} from 'src/interfaces/messenger';

const actions: ActionTree<MessengerStateInterface, StateInterface> = {
  SOCKET_messenger_dialog_create(
    { commit, rootState },
    payload: MessengerDialogInterface
  ) {
    return new Promise(() => {
      commit('dialogs', payload);

      if (payload.message.from.id === rootState.user.profile?.id) {
        commit(
          'route/push',
          <
            string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
          >{
            name: 'messengerDialog',
            params: { id: payload.id },
          },
          { root: true }
        );
      } else {
        Notify.create({
          position: 'bottom-right',
          icon: 'fa-regular fa-message',
          message: 'Новое сообщение',
          caption: payload.message.from.username,
          classes: 'no-shadow',
          progress: true,
          actions: [
            {
              label: 'Открыть',
              color: 'yellow',
              handler: () => {
                commit(
                  'route/push',
                  <
                    | string
                    | RouteLocationAsRelativeGeneric
                    | RouteLocationAsPathGeneric
                  >{
                    name: 'messengerDialog',
                    params: { id: payload.id },
                  },
                  { root: true }
                );
              },
            },
          ],
        });
      }
    });
  },
  SOCKET_messenger_send_message(
    { commit, rootState },
    payload: MessengerMessageInterface
  ) {
    return new Promise(() => {
      if (
        rootState.route.data?.name === 'messengerDialog' &&
        rootState.route.data?.params.id === payload.dialog.toString()
      ) {
        commit('messages', payload);
        socket.emit('messenger_read_dialog', payload.dialog.toString());
      } else {
        Notify.create({
          position: 'bottom-right',
          icon: 'fa-regular fa-message',
          message: 'Новое сообщение',
          caption: payload.from.username,
          classes: 'no-shadow',
          progress: true,
          actions: [
            {
              label: 'Открыть',
              color: 'yellow',
              handler: () => {
                commit(
                  'route/push',
                  <
                    | string
                    | RouteLocationAsRelativeGeneric
                    | RouteLocationAsPathGeneric
                  >{
                    name: 'messengerDialog',
                    params: { id: payload.dialog },
                  },
                  { root: true }
                );
              },
            },
          ],
        });
      }

      socket.emit('messenger_dialog_list');
    });
  },
};

export default actions;
