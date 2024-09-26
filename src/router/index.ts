import { computed, watch } from 'vue';
import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteLocationNormalized,
  NavigationGuardNext,
  RouteRecordRaw,
  RouteLocationNormalizedGeneric,
  RouteLocationAsRelativeGeneric,
  RouteLocationAsPathGeneric,
} from 'vue-router';
import { StateInterface } from '../store';
import multiguard from 'vue-router-multiguard';

export default route<StateInterface>(function ({ store }) {
  const IF_AUTHENTICATED = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => (store.getters['user/auth'] ? next() : next({ name: 'signin' }));

  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      component: () => import('layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'index',
          component: () => import('pages/IndexPage.vue'),
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('pages/SignUpPage.vue'),
        },
        {
          path: 'signin',
          name: 'signin',
          component: () => import('pages/SignInPage.vue'),
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('pages/ProfilePage.vue'),
          beforeEnter: multiguard([IF_AUTHENTICATED]),
        },
        {
          path: '/messenger',
          name: 'messenger',
          component: () => import('pages/messenger/IndexPage.vue'),
          beforeEnter: multiguard([IF_AUTHENTICATED]),
        },
        {
          path: '/messenger/dialog/:id',
          name: 'messengerDialog',
          component: () => import('pages/messenger/DialogPage.vue'),
          beforeEnter: multiguard([IF_AUTHENTICATED]),
        },
      ],
    },
    {
      path: '/:catchAll(.*)*',
      component: () => import('pages/ErrorNotFound.vue'),
    },
  ];

  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(
      process.env.MODE === 'ssr' ? void 0 : process.env.VUE_ROUTER_BASE
    ),
  });

  const push = computed(() => store.getters['route/push']);

  watch(
    push,
    (
      data: string | RouteLocationAsRelativeGeneric | RouteLocationAsPathGeneric
    ) => {
      Router.push(data);
    }
  );

  Router.beforeEach(
    (
      to: RouteLocationNormalized,
      from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      store.dispatch('route/set', <RouteLocationNormalizedGeneric>to);
      store.dispatch('user/init', false).then(() => next());
    }
  );

  return Router;
});
