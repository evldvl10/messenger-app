import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { MessengerStateInterface } from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const messengerModule: Module<MessengerStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state,
};

export default messengerModule;
