export interface MessengerDialogInterface {
  id: number;
  message: MessengerMessageInterface;
  owner: MessengerUserInterface;
  user: MessengerUserInterface;
}

export interface MessengerUserInterface {
  id: number;
  username: string;
}

export interface MessengerDialogMessagesInterface {
  details: MessengerDialogInterface;
  messages: MessengerMessageInterface[];
}

export interface MessengerMessageInterface {
  id: number;
  dialog: number;
  created: Date;
  from: MessengerUserInterface;
  to: MessengerUserInterface;
  type: string;
  metadata: string;
  data: string;
  read: boolean;
}

export interface MessengerUserStatus {
  Id: number;
  Status: boolean;
}
