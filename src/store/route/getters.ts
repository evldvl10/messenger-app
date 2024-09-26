import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { RouteStateInterface } from './state';
import {
  RouteLocationNormalizedGeneric,
  RouteLocationAsRelativeGeneric,
  RouteLocationAsPathGeneric,
} from 'vue-router';

const getters: GetterTree<RouteStateInterface, StateInterface> = {
  data(state: RouteStateInterface): RouteLocationNormalizedGeneric | null {
    return state.data;
  },
  push(
    state: RouteStateInterface
  ):
    | null
    | string
    | RouteLocationAsRelativeGeneric
    | RouteLocationAsPathGeneric {
    return state.push;
  },
};

export default getters;
