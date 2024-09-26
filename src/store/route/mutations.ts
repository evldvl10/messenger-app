import { MutationTree } from 'vuex';
import { RouteStateInterface } from './state';
import {
  RouteLocationNormalizedGeneric,
  RouteLocationAsRelativeGeneric,
  RouteLocationAsPathGeneric,
} from 'vue-router';

const mutation: MutationTree<RouteStateInterface> = {
  data(state: RouteStateInterface, payload: RouteLocationNormalizedGeneric) {
    state.data = payload;
  },
  push(
    state: RouteStateInterface,
    payload:
      | null
      | string
      | RouteLocationAsRelativeGeneric
      | RouteLocationAsPathGeneric
  ) {
    state.push = payload;
  },
};

export default mutation;
