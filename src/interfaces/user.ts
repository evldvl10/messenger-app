export enum PasswordFieldType {
  Password = 'password',
  Text = 'text',
}

export interface UserSigninRequestInterface {
  login: string;
  password: string;
}

export interface UserSigninResponseInterface {
  access: string;
  refresh: string;
  '2fa': boolean;
}

export interface UserSignupInterface {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
  passwordFieldType: PasswordFieldType;
  accept: boolean;
}

export interface UserProfileInterface {
  id: number;
  created: number;
  username: string;
  email: string;
  otp: boolean;
}

export interface UserOtpValidateRequestInterface {
  access: string;
  token: string;
}

export interface UserOtpSecretResponseInterface {
  secret: string;
  url: string;
}

export interface UserOtpDisableRequestInterface {
  password: string;
  token: string;
}

export interface UserMessageEventUser {
  id: string;
  //username: string;
}

export interface UserMessageEvent {
  from: UserMessageEventUser;
  to: UserMessageEventUser;
  message: string;
}
