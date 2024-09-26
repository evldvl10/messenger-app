<template>
  <q-page>
    <h5 class="q-my-lg">Профиль</h5>

    <div class="row q-col-gutter-md">
      <div class="col">
        <q-list bordered class="q-mb-md">
          <q-item>
            <q-item-section>
              <q-item-label>E-Mail</q-item-label>
              <q-item-label caption>{{ profile.email }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Имя пользователя</q-item-label>
              <q-item-label caption>{{ profile.username }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>Дата регистрации</q-item-label>
              <q-item-label caption>{{ profile.created }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-btn
          unelevated
          color="primary"
          text-color="white"
          label="Выйти"
          size="md"
          @click="logout"
        />
      </div>
      <div class="col">
        <div class="bg-grey-2 q-pa-lg">
          <div v-if="profile.otp">
            <div class="text-h4">2FA включена</div>
            <div class="q-mt-lg">
              <q-btn
                unelevated
                color="red"
                text-color="white"
                label="Отключить 2FA"
                size="md"
                @click="showDisableOtpDialog"
              />
            </div>
          </div>
          <div v-else>
            <div class="text-h4">2FA выключена</div>
            <div class="q-mt-lg">
              <q-btn
                unelevated
                color="green"
                text-color="white"
                label="Включить 2FA"
                size="md"
                @click="showEnableOtpPasswordDialog"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enable 2fa password dialog -->
    <q-dialog v-model="enableOtpPasswordDialog">
      <q-card style="width: 400px">
        <q-card-section class="row items-center q-pa-none">
          <div class="text-subtitle1 text-weight-bold q-pa-md">
            Введите пароль
          </div>
          <q-space />
          <q-btn class="q-ma-md" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner inline-actions rounded class="bg-grey-2 text-black">
            В целях безопасности для изменения настроек 2FA необходимо ввести
            текущий пароль.
          </q-banner>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            type="password"
            v-model="enableOtpPassword"
            label="Пароль"
            color="primary"
            @keydown.enter.prevent="enableOtp"
          />
        </q-card-section>

        <q-card-section>
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Продолжить"
            size="md"
            @click="enableOtp"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Enable 2fa dialog -->
    <q-dialog v-model="enableOtpDialog">
      <q-card style="width: 550px">
        <q-card-section class="row items-center q-pa-none">
          <div class="text-subtitle1 text-weight-bold q-pa-md">
            Активация 2FA
          </div>
          <q-space />
          <q-btn class="q-ma-md" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="row q-col-gutter-xl">
            <div class="col-4">
              <qrcode-vue :value="enableOtpData?.url" :size="170" />
            </div>
            <div class="col">
              <q-banner
                inline-actions
                rounded
                class="bg-grey-2 text-black q-mb-md"
              >
                Для активации 2FA необходимо отсканировать QR-код в вашем
                приложении и ввести проверочный код из приложения в форму ниже.
              </q-banner>
              <q-input
                outlined
                type="text"
                v-model="enableOtpToken"
                label="Проверочный код"
                color="primary"
                @keydown.enter.prevent="verifyOtp"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Активировать"
            size="md"
            @click="verifyOtp"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Disable 2fa dialog -->
    <q-dialog v-model="disableOtpDialog">
      <q-card style="width: 400px">
        <q-card-section class="row items-center q-pa-none">
          <div class="text-subtitle1 text-weight-bold q-pa-md">
            Отключение 2FA
          </div>
          <q-space />
          <q-btn class="q-ma-md" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner inline-actions rounded class="bg-grey-2 text-black">
            Для отключения 2FA необходимо ввести проверочный код из приложения в
            форму ниже и текущий пароль.
          </q-banner>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            type="password"
            v-model="disableOtpData.password"
            label="Текущий пароль"
            color="primary"
            @keydown.enter.prevent="disableOtp"
          />
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            type="text"
            v-model="disableOtpData.token"
            label="Проверочный код"
            color="primary"
            @keydown.enter.prevent="disableOtp"
          />
        </q-card-section>
        <q-card-section>
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Отключить 2FA"
            size="md"
            @click="disableOtp"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Notify } from 'quasar';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';
import QrcodeVue from 'qrcode.vue';

import {
  UserOtpSecretResponseInterface,
  UserOtpDisableRequestInterface,
} from 'src/interfaces/user';

defineOptions({
  name: 'ProfilePage',
  components: {
    QrcodeVue,
  },
});

const router = useRouter();
const store = useStore();
const profile = computed(() => store.getters['user/profile']);

const enableOtpPasswordDialog = ref<boolean>(false);
const enableOtpPassword = ref<string>('');

const enableOtpDialog = ref<boolean>(false);
const enableOtpData = ref<UserOtpSecretResponseInterface>();
const enableOtpToken = ref<string>('');

const disableOtpDialog = ref<boolean>(false);
const disableOtpData = ref<UserOtpDisableRequestInterface>({
  password: '',
  token: '',
});

const logout = () => {
  store.dispatch('user/logout').then(() => router.push({ name: 'index' }));
};

const showEnableOtpPasswordDialog = () => {
  enableOtpPassword.value = '';
  enableOtpPasswordDialog.value = true;
};

const showDisableOtpDialog = () => {
  disableOtpData.value = {
    password: '',
    token: '',
  };
  disableOtpDialog.value = true;
};

const enableOtp = () => {
  store
    .dispatch('user/enableOtp', enableOtpPassword.value)
    .then((response) => {
      enableOtpPasswordDialog.value = false;
      enableOtpData.value = response;
      enableOtpToken.value = '';
      enableOtpDialog.value = true;
    })
    .catch(() => {
      Notify.create({
        position: 'top',
        message: 'Неверный пароль',
        classes: 'no-shadow',
      });
    });
};

const verifyOtp = () => {
  store
    .dispatch('user/verifyOtp', enableOtpToken.value)
    .then(() => {
      enableOtpDialog.value = false;
      Notify.create({
        position: 'top',
        message: '2FA включена',
        classes: 'no-shadow',
      });
    })
    .catch(() => {
      Notify.create({
        position: 'top',
        message: 'Неверный код активации',
        classes: 'no-shadow',
      });
    });
};

const disableOtp = () => {
  store
    .dispatch('user/disableOtp', disableOtpData.value)
    .then(() => {
      disableOtpDialog.value = false;
      Notify.create({
        position: 'top',
        message: '2FA отключена',
        classes: 'no-shadow',
      });
    })
    .catch(() => {
      Notify.create({
        position: 'top',
        message: 'Неверные данные для отключения 2FA',
        classes: 'no-shadow',
      });
    });
};
</script>
