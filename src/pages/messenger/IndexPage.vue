<template>
  <q-page class="page-chat flex column">
    <div class="row">
      <div class="col">
        <h5 class="q-my-lg">Сообщения</h5>
      </div>
      <div class="col-auto">
        <q-btn
          push
          color="primary"
          round
          class="q-my-lg"
          @click="userListDialog = true"
        >
          <q-icon name="fa-solid fa-pen" size="16px" />
        </q-btn>
      </div>
    </div>

    <div
      v-if="dialogs.length"
      class="column col"
      style="border: 1px solid #e3e3e3"
    >
      <q-virtual-scroll
        style="height: calc(100vh - 20rem)"
        :items="dialogs"
        v-slot="{ item, index }"
      >
        <q-item
          :key="index"
          clickable
          v-ripple
          :class="{ 'bg-orange-1': !item.message.read }"
          @click="openDialog(item.user.id, item.user.username)"
          style="height: 64px"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <q-icon name="fa-solid fa-user" size="16px" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <q-icon
                v-if="userStatus.find(
                  (s: any) => parseInt(s.id) === item.user.id && s.status
                )"
                name="fa-solid fa-circle"
                size="8px"
                class="text-green q-mr-xs"
              />{{ item.user.username }}
            </q-item-label>
            <q-item-label caption lines="2"
              ><span
                v-if="item.message.from.id === item.owner.id"
                class="q-mr-xs"
                >Вы:</span
              >
              <span v-if="item.message.type === 'text'">
                {{ item.message.data }}
              </span>
              <span v-if="item.message.type === 'image'">изображение</span>
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>{{
              date.formatDate(Date.now(), 'YYYY-MM-DD') ===
              date.formatDate(item.message.created, 'YYYY-MM-DD')
                ? date.formatDate(item.message.created, 'HH:mm')
                : date.formatDate(item.message.created, 'YYYY-MM-DD')
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-virtual-scroll>
    </div>
    <div
      v-else
      class="q-pa-md column col justify-center text-center"
      style="border: 1px solid #e3e3e3"
    >
      Диалогов нет
    </div>

    <q-dialog v-model="userListDialog" position="right" maximized>
      <q-card style="width: 350px">
        <q-card-section class="q-pa-none">
          <q-list separator>
            <q-item clickable v-ripple @click="openDialog('1', 'user1')">
              <q-item-section avatar>
                <q-icon color="primary" name="fas fa-user" />
              </q-item-section>
              <q-item-section>user1</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="openDialog('2', 'user2')">
              <q-item-section avatar>
                <q-icon color="primary" name="fas fa-user" />
              </q-item-section>
              <q-item-section>user2</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="openDialog('3', 'user3')">
              <q-item-section avatar>
                <q-icon color="primary" name="fas fa-user" />
              </q-item-section>
              <q-item-section>user3</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="createFormDialog">
      <q-card style="width: 450px">
        <q-card-section>
          <q-input
            outlined
            autofocus
            autogrow
            v-model="createDialogMessage"
            :placeholder="'Сообщение для ' + createDialogUsername"
            @keydown.enter.prevent="createDialog"
          >
            <template v-slot:append>
              <q-btn
                v-if="createDialogMessage"
                round
                dense
                flat
                icon="send"
                @click="createDialog"
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
        </q-card-section>
      </q-card>
    </q-dialog>

    <input
      type="file"
      ref="selectImage"
      @change="uploadImage($event)"
      style="opacity: 0; position: absolute; z-index: -1"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { date } from 'quasar';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';
import { socket } from 'src/boot/socket.io';

import { MessengerDialogInterface } from 'src/interfaces/messenger';

defineOptions({
  name: 'MessengerIndexPage',
});

const router = useRouter();
const store = useStore();

const selectImage = ref();

const userListDialog = ref<boolean>(false);
const createFormDialog = ref<boolean>(false);

const createDialogId = ref<string>('');
const createDialogUsername = ref<string>('');
const createDialogMessage = ref<string>('');

const dialogs = computed(() => store.getters['messenger/dialogs']);
const userStatus = computed(() => store.getters['messenger/userStatus']);

const openDialog = (id: string, username: string) => {
  userListDialog.value = false;

  const dialog = dialogs.value.find(
    (dialog: MessengerDialogInterface) => dialog.user.id === parseInt(id)
  );

  if (dialog) {
    router.push({ name: 'messengerDialog', params: { id: dialog.id } });
  } else {
    showCreateDialog(id, username);
  }
};

const showCreateDialog = (id: string, username: string) => {
  createDialogId.value = id;
  createDialogUsername.value = username;
  createDialogMessage.value = '';
  createFormDialog.value = true;
};

const createDialog = () => {
  socket.emit(
    'messenger_dialog_create',
    createDialogId.value,
    'text',
    createDialogMessage.value
  );

  createFormDialog.value = false;
};

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
            'messenger_dialog_create',
            createDialogId.value,
            'image',
            fileData[1]
          );

          createFormDialog.value = false;
        }
      };
    };

    reader.readAsDataURL(input.files[0]);
  }
};
</script>
