import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { UserStateInterface } from './state';

import { Loading, Cookies, Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { socket } from 'src/boot/socket.io';

import {
  UserSigninRequestInterface,
  UserSigninResponseInterface,
  UserSignupInterface,
  UserOtpSecretResponseInterface,
  UserOtpValidateRequestInterface,
  UserOtpDisableRequestInterface,
} from 'src/interfaces/user';

export interface UserLoginInterface {
  access: string;
  refresh: string;
}

const actions: ActionTree<UserStateInterface, StateInterface> = {
  init({ dispatch, commit, state }, force: boolean) {
    return new Promise((resolve, reject) => {
      if (
        (Cookies.get('refresh_token') && !state.auth) ||
        (Cookies.get('refresh_token') && force)
      ) {
        Loading.show();
        api({
          url: 'v1/auth/token/renew',
          data: {
            refresh_token: Cookies.get('refresh_token'),
          },
          method: 'post',
        })
          .then((response) => {
            Loading.hide();
            switch (response.data.status) {
              case 'success':
                dispatch('login', <UserLoginInterface>{
                  access: response.data.data.access,
                  refresh: response.data.data.refresh,
                }).then(() => {
                  dispatch('profile')
                    .then(() => {
                      commit('init', true);
                      resolve(null);
                    })
                    .catch(() => {
                      commit('init', false);
                      reject();
                    });
                });
                break;
              case 'error':
                dispatch('logout').then(() => {
                  commit('init', true);
                  resolve(null);
                });
            }
          })
          .catch(() => {
            Loading.hide();
            commit('init', false);
            reject();
          });
      } else {
        commit('init', true);
        resolve(null);
      }
    });
  },
  login({ dispatch, commit }, data: UserLoginInterface) {
    return new Promise((resolve) => {
      Cookies.set('access_token', data.access, {
        expires: '365d',
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });
      Cookies.set('refresh_token', data.refresh, {
        expires: '365d',
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });

      api.defaults.headers.common.Authorization = 'Bearer ' + data.access;

      socket.disconnect();
      socket.io.opts.query = { token: data.access };
      setTimeout(() => socket.connect(), 100);

      setTimeout(
        () => dispatch('init', true),
        parseInt(<string>process.env.TOKEN_TIMEOUT) * 60 * 1000
      );

      commit('auth', true);
      resolve(null);
    });
  },
  logout({ commit }) {
    return new Promise((resolve) => {
      Cookies.remove('access_token', {
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });
      Cookies.remove('refresh_token', {
        path: '/',
        domain: process.env.COOKIE_DOMAIN,
      });
      commit('auth', false);
      commit('profile', null);
      delete api.defaults.headers.common.Authorization;

      socket.disconnect();
      delete socket.io.opts.query;
      setTimeout(() => socket.connect(), 100);

      resolve(null);
    });
  },
  profile({ commit }) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/user/profile',
        method: 'get',
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              commit('profile', response.data.data);
              resolve(null);
              break;
            case 'error':
              Notify.create({
                position: 'top',
                message: 'Произошла ошибка при загрузке профиля пользователя',
                classes: 'no-shadow',
              });
              reject();
          }
        })
        .catch(() => {
          Notify.create({
            position: 'top',
            message: 'Произошла ошибка при загрузке профиля пользователя',
            classes: 'no-shadow',
          });
          reject();
        })
        .finally(() => Loading.hide());
    });
  },
  signin({ dispatch }, data: UserSigninRequestInterface) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/auth/signin',
        data,
        method: 'post',
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              Cookies.set('login', data.login, {
                expires: '365d',
                path: '/',
                domain: process.env.COOKIE_DOMAIN,
              });

              if (response.data.data['2fa']) {
                resolve(<UserSigninResponseInterface>response.data.data);
              } else {
                dispatch('login', <UserLoginInterface>{
                  access: response.data.data.access,
                  refresh: response.data.data.refresh,
                }).then(() => {
                  dispatch('profile')
                    .then(() =>
                      resolve(<UserSigninResponseInterface>response.data.data)
                    )
                    .catch(() => reject());
                });
              }
              break;
            case 'error':
              reject();
          }
        })
        .catch(() => reject())
        .finally(() => Loading.hide());
    });
  },
  signup({}, data: UserSignupInterface) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/auth/signup',
        data: {
          email: data.email.trim(),
          username: data.username.trim(),
          password: data.password.trim(),
        },
        method: 'post',
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              resolve(null);
              break;
            case 'error':
              reject();
          }
        })
        .catch(() => reject())
        .finally(() => Loading.hide());
    });
  },
  enableOtp({}, password: string) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/auth/2fa/secret',
        data: {
          password: password.trim(),
        },
        method: 'post',
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              resolve(<UserOtpSecretResponseInterface>response.data.data);
              break;
            case 'error':
              reject();
          }
        })
        .catch(() => reject())
        .finally(() => Loading.hide());
    });
  },
  verifyOtp({ dispatch }, token: string) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/auth/2fa/verify',
        data: {
          token: token.trim(),
        },
        method: 'post',
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              dispatch('profile')
                .then(() => resolve(null))
                .catch(() => reject());
              break;
            case 'error':
              reject();
          }
        })
        .catch(() => reject())
        .finally(() => Loading.hide());
    });
  },
  validateOtp({ dispatch }, data: UserOtpValidateRequestInterface) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/auth/2fa/validate',
        data: {
          token: data.token.trim(),
        },
        method: 'post',
        headers: {
          Authorization: 'Bearer ' + data.access,
        },
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              dispatch('login', <UserLoginInterface>{
                access: response.data.data.access,
                refresh: response.data.data.refresh,
              }).then(() => {
                dispatch('profile')
                  .then(() =>
                    resolve(<UserSigninResponseInterface>response.data.data)
                  )
                  .catch(() => reject());
              });
              break;
            case 'error':
              reject();
          }
        })
        .catch(() => reject())
        .finally(() => Loading.hide());
    });
  },
  disableOtp({ dispatch }, data: UserOtpDisableRequestInterface) {
    return new Promise((resolve, reject) => {
      Loading.show();
      api({
        url: 'v1/auth/2fa/disable',
        data,
        method: 'post',
      })
        .then((response) => {
          switch (response.data.status) {
            case 'success':
              dispatch('profile')
                .then(() => resolve(null))
                .catch(() => reject());
              break;
            case 'error':
              reject();
          }
        })
        .catch(() => reject())
        .finally(() => Loading.hide());
    });
  },
};

export default actions;
