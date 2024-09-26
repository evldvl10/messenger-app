<template>
  <q-page v-if="dialog" class="page-chat flex column">
    <q-item style="margin: 13px 0; padding-left: 0">
      <q-item-section top avatar>
        <q-avatar color="primary" text-color="white">
          <q-icon name="fa-solid fa-user" size="16px" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label>
          {{ dialog.user.username }}
        </q-item-label>
        <q-item-label caption>
          <q-icon
            name="fa-solid fa-circle"
            size="8px"
            :class="{
              'text-green': userStatus.find((s: any) => parseInt(s.id) === dialog.user.id && s.status), 
              'text-grey': !userStatus.find((s: any) => parseInt(s.id) === dialog.user.id && s.status), 
            }"
          />
          <span class="q-ml-xs">
            {{
              userStatus.find(
                (s: any) => parseInt(s.id) === dialog.user.id && s.status
              )
                ? 'онлайн'
                : 'не в сети'
            }}
          </span>
        </q-item-label>
      </q-item-section>
    </q-item>

    <div class="column col justify-end" style="border: 1px solid #e3e3e3">
      <q-scroll-area
        ref="scrollArea"
        @scroll="onScrollArea"
        :delay="0"
        :thumb-style="{
          borderRadius: '0px',
          backgroundColor: 'grey',
          width: '6px',
          opacity: '0.75',
        }"
        :bar-style="{
          borderRadius: '0px',
          backgroundColor: 'grey',
          width: '6px',
          opacity: '0.2',
        }"
        :style="{
          height: 'calc(100vh - 17rem)',
          visibility: scrollAreaVisible,
        }"
      >
        <div
          v-for="(item, index) in messages"
          :key="item"
          class="q-px-lg q-my-md"
        >
          <q-chat-message
            v-if="
              index === 0 ||
              date.formatDate(item.created, 'YYYY-MM-DD') !==
                date.formatDate(messages[index - 1].created, 'YYYY-MM-DD')
            "
            :label="
              date.formatDate(Date.now(), 'YYYY-MM-DD') ===
              date.formatDate(item.created, 'YYYY-MM-DD')
                ? 'Сегодня'
                : date.formatDate(item.created, 'YYYY-MM-DD')
            "
          />

          <q-chat-message
            :sent="profile.id.toString() === item.from.id.toString()"
            :bg-color="
              profile.id.toString() === item.from.id.toString()
                ? 'green'
                : 'grey-3'
            "
            :text-color="
              profile.id.toString() === item.from.id.toString()
                ? 'white'
                : 'black'
            "
          >
            <div v-if="item.type === 'text'">
              <q-icon
                name="fa-solid fa-bars"
                size="10px"
                class="float-right cursor-pointer q-ml-sm"
              >
                <q-menu>
                  <q-list dense style="min-width: 100px">
                    <q-item clickable v-close-popup>
                      <q-item-section>Копировать</q-item-section>
                    </q-item>
                    <q-item
                      v-if="profile.id.toString() === item.from.id.toString()"
                      clickable
                      v-close-popup
                    >
                      <q-item-section>Редактировать</q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup>
                      <q-item-section class="text-red">Удалить</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-icon>
              {{ item.data }}
            </div>
            <div v-if="item.type === 'image'">
              <q-icon
                name="fa-solid fa-bars"
                size="10px"
                class="float-right cursor-pointer q-ml-sm"
              >
                <q-menu>
                  <q-list dense style="min-width: 100px">
                    <q-item clickable v-close-popup>
                      <q-item-section class="text-red">Удалить</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-icon>
              <q-img
                @click="
                  openURL(
                    'http://localhost:8088/v1/messenger/image/' + item.data
                  )
                "
                :src="'http://localhost:8088/v1/messenger/image/' + item.data"
                spinner-color="black"
                style="border-radius: 5px"
                height="120px"
                width="200px"
                class="cursor-pointer"
              />
            </div>
            <template v-slot:stamp
              ><div style="font-size: 11px">
                {{ date.formatDate(item.created, 'HH:mm') }}
              </div></template
            >
          </q-chat-message>
        </div>
        <q-banner
          v-if="unreadMessages"
          @click="scrollArea.setScrollPercentage('vertical', 1, 100)"
          dense
          class="text-black text-center bg-orange-2 fixed-bottom cursor-pointer"
        >
          Есть новые сообщения
        </q-banner>
      </q-scroll-area>
    </div>

    <div class="q-my-md">
      <q-input
        outlined
        autofocus
        v-model="message"
        placeholder="Сообщение"
        @keydown.enter.prevent="sendMessage"
      >
        <template v-slot:append>
          <q-btn
            v-if="message"
            round
            dense
            flat
            icon="send"
            @click="sendMessage"
          />
          <q-btn
            v-else
            round
            dense
            flat
            icon="fa-solid fa-paperclip"
            @click="selectImage.click()"
          />
        </template>
      </q-input>
    </div>

    <input
      type="file"
      ref="selectImage"
      @change="uploadImage($event)"
      style="opacity: 0; position: absolute; z-index: -1"
    />
  </q-page>
</template>

<style>
.q-message-container > div {
  max-width: 80% !important;
}
</style>

<script setup lang="ts">
import { date, openURL } from 'quasar';
import { ref, computed, watch } from 'vue';
import { useStore } from 'src/store';
import { useRoute } from 'vue-router';
import { socket } from 'src/boot/socket.io';

import { MessengerMessageInterface } from 'src/interfaces/messenger';

defineOptions({
  name: 'MessengerDialogPage',
});

const route = useRoute();
const store = useStore();

const scrollArea = ref();
const selectImage = ref();

const scrollAreaVisible = ref<string>('hidden');
const message = ref<string>('');
const unreadMessages = ref<boolean>(false);

const profile = computed(() => store.getters['user/profile']);
const dialog = computed(() => store.getters['messenger/dialog']);
const messages = computed(() => store.getters['messenger/messages']);
const userStatus = computed(() => store.getters['messenger/userStatus']);

const sendMessage = () => {
  if (message.value === '') return;
  socket.emit('messenger_send_message', route.params.id, 'text', message.value);
  message.value = '';
};

socket.emit('messenger_dialog_messages', route.params.id);

watch(messages, (messages: MessengerMessageInterface[]) => {
  if (scrollArea.value)
    if (scrollArea.value.getScrollPercentage().top === 1)
      setTimeout(
        () => scrollArea.value.setScrollPercentage('vertical', 1, 100),
        300
      );
    else if (messages[messages.length - 1].from.id === profile.value.id)
      setTimeout(
        () => scrollArea.value.setScrollPercentage('vertical', 1, 100),
        100
      );
    else {
      if (
        scrollArea.value.getScroll().verticalContainerSize <
        scrollArea.value.getScroll().verticalSize
      )
        unreadMessages.value = true;
    }
  else setTimeout(() => scrollArea.value.setScrollPercentage('vertical', 1));
});

const onScrollArea = (data: { verticalPercentage: number }) => {
  if (data.verticalPercentage === 1) unreadMessages.value = false;
};

setTimeout(() => scrollArea.value.setScrollPercentage('vertical', 1), 100);
setTimeout(() => (scrollAreaVisible.value = 'visible'), 150);

// @ts-ignore
const uploadImage = (event) => {
  const input = event.target;

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = <string>reader.result;

      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = img.width;
        elem.height = img.height;

        const ctx = elem.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, img.width, img.height);

          var rawFile = ctx.canvas.toDataURL('image/png');
          const fileData = rawFile.split(',');

          socket.emit(
            'messenger_send_message',
            route.params.id,
            'image',
            fileData[1]
          );
        }
      };
    };

    reader.readAsDataURL(input.files[0]);
  }
};
</script>
