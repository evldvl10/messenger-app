import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { RouteStateInterface } from './state';

import { RouteLocationNormalizedGeneric } from 'vue-router';

const actions: ActionTree<RouteStateInterface, StateInterface> = {
  set({ commit }, data: RouteLocationNormalizedGeneric) {
    return new Promise(() => {
      commit('data', data);
    });
  },
};

export default actions;
