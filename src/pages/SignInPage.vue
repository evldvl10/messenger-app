<template>
  <q-page class="flex flex-center">
    <div class="row" style="width: 700px">
      <div class="col-6">
        <q-card flat style="width: 350px">
          <q-card-section class="q-py-none q-ma-none">
            <q-input
              outlined
              v-model="signin.login"
              label="Логин"
              color="primary"
              @keydown.enter.prevent="postSignin"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-6">
        <q-card flat style="width: 350px">
          <q-card-section class="q-py-none q-ma-none">
            <q-input
              outlined
              type="password"
              v-model="signin.password"
              label="Пароль"
              color="primary"
              @keydown.enter.prevent="postSignin"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <div class="q-mx-md q-mt-lg">
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Войти"
            size="md"
            @click="postSignin"
          />
        </div>
      </div>
    </div>

    <!-- 2fa dialog -->
    <q-dialog v-model="otpDialog">
      <q-card style="width: 400px">
        <q-card-section class="row items-center q-pa-none">
          <div class="text-subtitle1 text-weight-bold q-pa-md">
            2FA подтверждение
          </div>
          <q-space />
          <q-btn class="q-ma-md" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-banner inline-actions rounded class="bg-grey-2 text-black">
            Для входа необходимо ввести проверочный код из приложения в форму
            ниже.
          </q-banner>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            type="text"
            v-model="otpData.token"
            label="Проверочный код"
            color="primary"
            @keydown.enter.prevent="validateOtp"
          />
        </q-card-section>
        <q-card-section>
          <q-btn
            unelevated
            color="primary"
            text-color="white"
            label="Войти"
            size="md"
            @click="validateOtp"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  UserSigninRequestInterface,
  UserOtpValidateRequestInterface,
} from 'src/interfaces/user';
import { Notify } from 'quasar';
import { useStore } from 'src/store';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'SignInPage',
});

const router = useRouter();
const store = useStore();
const signin = ref<UserSigninRequestInterface>({
  login: '',
  password: '',
});
const otpDialog = ref<boolean>(false);
const otpData = ref<UserOtpValidateRequestInterface>({
  access: '',
  token: '',
});

const successAuth = () => {
  Notify.create({
    position: 'top',
    message: 'Вы успешно вошли',
    classes: 'no-shadow',
  });

  router.push({ name: 'profile' });
};

const postSignin = () => {
  store
    .dispatch('user/signin', signin.value)
    .then((response) => {
      if (response['2fa']) {
        otpData.value.access = response.access;
        otpDialog.value = true;
      } else {
        successAuth();
      }
    })
    .catch(() => {
      Notify.create({
        position: 'top',
        message: 'Неверные данные для входа',
        classes: 'no-shadow',
      });
    });
};

const validateOtp = () => {
  store
    .dispatch('user/validateOtp', otpData.value)
    .then(() => successAuth())
    .catch(() => {
      Notify.create({
        position: 'top',
        message: 'Неверный код подтверждения',
        classes: 'no-shadow',
      });
    });
};
</script>
