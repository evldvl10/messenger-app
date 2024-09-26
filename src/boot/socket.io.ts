import { reactive } from 'vue';
import { boot } from 'quasar/wrappers';
import VueSocketIO from 'vue-3-socket.io';
import SocketIO from 'socket.io-client';

export const state = reactive({
  connected: false,
  personal: false,
});

const url = process.env.API_SERVER as string;
const socket = SocketIO(url);

socket.on('connect', () => {
  state.personal = socket.io.opts.query ? true : false;
  state.connected = true;
  setTimeout(() => socket.emit('init'), 100);
});
socket.on('disconnect', () => (state.connected = false));

export default boot(({ app, store }) => {
  app.use(
    new VueSocketIO({
      debug: true,
      connection: socket,
      vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_',
      },
    })
  );
});

export { socket };
