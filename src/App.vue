<template>
  <q-banner v-if="initState === false" inline-actions class="text-white bg-red">
    Ошибка инициализации приложения. Попробуйте через несколько минут.
  </q-banner>
  <router-view v-if="initState" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'src/store';
import { socket } from 'src/boot/socket.io';

defineOptions({
  name: 'App',
});

const store = useStore();
const initState = computed(() => store.getters['user/init']);

setTimeout(() => {
  socket.emit('messenger_user_status');
}, 5000);
</script>
