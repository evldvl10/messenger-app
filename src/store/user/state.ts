import { UserProfileInterface, UserMessageEvent } from 'src/interfaces/user';

export interface UserStateInterface {
  init: boolean | null;
  auth: boolean;
  profile: UserProfileInterface | null;
  messages: UserMessageEvent[];
}

function state(): UserStateInterface {
  return {
    init: null,
    auth: false,
    profile: null,
    messages: [],
  };
}

export default state;
