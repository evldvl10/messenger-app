<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          @click="router.push({ name: 'index' })"
          color="white"
          label="MESSENGER"
          flat
          class="rounded-borders text-bold"
        />

        <q-toolbar-title />

        <q-btn
          v-if="!auth"
          @click="router.push({ name: 'signin' })"
          color="white"
          label="Вход"
          flat
          class="rounded-borders text-bold"
        />
        <q-btn
          v-if="!auth"
          @click="router.push({ name: 'signup' })"
          color="white"
          label="Регистрация"
          flat
          class="rounded-borders text-bold"
        />

        <q-btn
          v-if="auth"
          @click="router.push({ name: 'messenger' })"
          color="white"
          flat
          class="rounded-borders text-bold"
        >
          Сообщения<q-badge
            v-if="unreadDialogs"
            color="orange"
            text-color="white"
            :label="unreadDialogs"
            class="q-ml-sm"
          />
        </q-btn>
        <q-btn
          v-if="auth"
          @click="router.push({ name: 'profile' })"
          color="white"
          :label="profile.username"
          flat
          class="rounded-borders text-bold"
        />
      </q-toolbar>
    </q-header>

    <q-footer>
      <q-toolbar class="bg-white text-black">
        <div v-if="state.connected" class="text-green">
          <q-icon
            name="fa-solid fa-circle"
            size="10px"
            class="text-green q-mr-xs"
          />
          <!--
          <span v-if="state.personal">Стабильное соединение</span>
          <span v-else>Стабильное соединение</span>
          -->
          Стабильное соединение
        </div>
        <div v-else class="text-orange">
          <q-icon
            name="fa-solid fa-circle"
            size="10px"
            class="text-orange q-mr-xs"
          />
          Восстановление соединения...
        </div>
      </q-toolbar>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'src/store';
import { state } from 'src/boot/socket.io';

import { MessengerDialogInterface } from 'src/interfaces/messenger';

defineOptions({
  name: 'MainLayout',
});

const router = useRouter();
const store = useStore();
const auth = computed(() => store.getters['user/auth']);
const profile = computed(() => store.getters['user/profile']);
const dialogs = computed(() => store.getters['messenger/dialogs']);
const unreadDialogs = computed(
  () =>
    dialogs.value.filter(
      (dialog: MessengerDialogInterface) => !dialog.message.read
    ).length
);
</script>
