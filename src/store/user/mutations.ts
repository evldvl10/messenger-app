import { MutationTree } from 'vuex';
import { UserStateInterface } from './state';

import { UserProfileInterface, UserMessageEvent } from 'src/interfaces/user';

const mutation: MutationTree<UserStateInterface> = {
  init(state: UserStateInterface, payload: boolean | null) {
    state.init = payload;
  },
  auth(state: UserStateInterface, payload: boolean) {
    state.auth = payload;
  },
  profile(state: UserStateInterface, payload: UserProfileInterface | null) {
    state.profile = payload;
  },
  SOCKET_message(state: UserStateInterface, payload: UserMessageEvent) {
    state.messages.push(payload);
  },
};

export default mutation;
