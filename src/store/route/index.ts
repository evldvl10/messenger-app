import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { RouteStateInterface } from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const routeModule: Module<RouteStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};

export default routeModule;
