import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { UserStateInterface } from './state';

import { UserProfileInterface, UserMessageEvent } from 'src/interfaces/user';

const getters: GetterTree<UserStateInterface, StateInterface> = {
  init(state: UserStateInterface): boolean | null {
    return state.init;
  },
  auth(state: UserStateInterface): boolean {
    return state.auth;
  },
  profile(state: UserStateInterface): UserProfileInterface | null {
    return state.profile;
  },
  messages(state: UserStateInterface): UserMessageEvent[] {
    return state.messages;
  },
};

export default getters;
