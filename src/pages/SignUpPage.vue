<template>
  <q-page class="flex flex-center">
    <q-card
      v-if="success"
      flat
      class="q-ma-md rounded-borders"
      v-ripple
      style="width: 350px"
    >
      <q-card-section class="q-pa-md text-center">
        Регистрация прошла успешно
      </q-card-section>
    </q-card>
    <div v-else class="row" style="width: 350px">
      <div class="col-12">
        <q-card flat class="q-my-md" style="width: 350px">
          <q-card-section class="q-py-none q-ma-none">
            <q-input
              outlined
              v-model="signup.email"
              label="E-Mail"
              color="primary"
              @keydown.enter.prevent="signupValidation"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat class="q-my-md" style="width: 350px">
          <q-card-section class="q-py-none q-ma-none">
            <q-input
              outlined
              v-model="signup.username"
              label="Имя пользователя"
              color="primary"
              @keydown.enter.prevent="signupValidation"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat class="q-my-md" style="width: 350px">
          <q-card-section class="q-py-none q-ma-none">
            <q-input
              outlined
              :type="signup.passwordFieldType"
              v-model="signup.password"
              label="Пароль"
              color="primary"
              @keydown.enter.prevent="signupValidation"
            >
              <template v-slot:append>
                <q-icon
                  v-if="signup.passwordFieldType === 'password'"
                  class="cursor-pointer"
                  name="fas fa-eye"
                  @click.prevent="switchVisibilityPassword"
                />
                <q-icon
                  v-if="signup.passwordFieldType === 'text'"
                  class="cursor-pointer"
                  name="fas fa-eye-slash"
                  @click.prevent="switchVisibilityPassword"
                />
              </template>
            </q-input>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <q-card flat class="q-my-md" style="width: 350px">
          <q-card-section class="q-py-none q-ma-none">
            <q-input
              outlined
              type="password"
              v-model="signup.repeatPassword"
              label="Повторите пароль"
              color="primary"
              @keydown.enter.prevent="signupValidation"
            />
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12">
        <div class="row">
          <div class="col-auto">
            <q-checkbox v-model="signup.accept" color="primary" />
          </div>
          <div class="col">
            <div class="q-my-sm">
              Принимаю
              <span
                @click="termsDialog = true"
                style="cursor: pointer; border-bottom: 1px dotted #000000"
                >условия использования</span
              >
            </div>
          </div>
        </div>
      </div>
      <div class="col-12">
        <q-btn
          class="q-mx-sm q-mt-lg"
          unelevated
          color="primary"
          text-color="white"
          label="Пройти регистрацию"
          size="md"
          @click="signupValidation"
        />
      </div>
    </div>

    <!-- Terms dialog -->
    <q-dialog v-model="termsDialog">
      <q-card style="width: 400px">
        <q-card-section class="row items-center q-pa-none">
          <div class="text-subtitle1 text-weight-bold q-pa-md">
            Условия использования
          </div>
          <q-space />
          <q-btn class="q-ma-md" icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section
          style="max-height: 500px"
          class="scroll q-pa-none q-mt-none"
        >
          <q-card>
            <q-card-section> Текст условий использования </q-card-section>
          </q-card>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { UserSignupInterface, PasswordFieldType } from 'src/interfaces/user';
import { Notify } from 'quasar';
import { useStore } from 'src/store';

defineOptions({
  name: 'SignUpPage',
});

const store = useStore();
const success = ref<boolean>(false);
const termsDialog = ref<boolean>(false);
const signup = ref<UserSignupInterface>({
  username: '',
  email: '',
  password: '',
  repeatPassword: '',
  passwordFieldType: PasswordFieldType.Password,
  accept: false,
});

const signupValidation = () => {
  if (signup.value.email.trim() === '') {
    Notify.create({
      position: 'top',
      message: 'Не введен E-Mail',
    });
    return;
  }
  if (signup.value.username.trim() === '') {
    Notify.create({
      position: 'top',
      message: 'Не введено имя пользователя',
    });
    return;
  }
  if (signup.value.password.trim() === '') {
    Notify.create({
      position: 'top',
      message: 'Пароль не введен',
    });
    return;
  }
  if (signup.value.repeatPassword.trim() === '') {
    Notify.create({
      position: 'top',
      message: 'Не введен повтор пароля',
    });
    return;
  }
  if (signup.value.password.trim() !== signup.value.repeatPassword.trim()) {
    Notify.create({
      position: 'top',
      message: 'Введенные пароли не совпадают',
    });
    return;
  }
  if (!signup.value.accept) {
    Notify.create({
      position: 'top',
      message: 'Необходимо принять условия использования',
    });
    return;
  }
  postSignup();
};

const postSignup = () => {
  store
    .dispatch('user/signup', signup.value)
    .then(() => {
      success.value = true;
    })
    .catch(() => {
      Notify.create({
        position: 'top',
        message: 'В процессе регистрации произошла ошибка',
        classes: 'no-shadow',
      });
    });
};

const switchVisibilityPassword = () =>
  (signup.value.passwordFieldType =
    signup.value.passwordFieldType === PasswordFieldType.Password
      ? PasswordFieldType.Text
      : PasswordFieldType.Password);
</script>
