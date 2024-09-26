import {
  RouteLocationNormalizedGeneric,
  RouteLocationAsRelativeGeneric,
  RouteLocationAsPathGeneric,
} from 'vue-router';

export interface RouteStateInterface {
  data: RouteLocationNormalizedGeneric | null;
  push:
    | null
    | string
    | RouteLocationAsRelativeGeneric
    | RouteLocationAsPathGeneric;
}

function state(): RouteStateInterface {
  return {
    data: null,
    push: null,
  };
}

export default state;
