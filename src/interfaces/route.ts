type RouteParamsGeneric = {
  [x: string]: string | string[];
}

export interface RouteInterface {
  name: string;
  params: RouteParamsGeneric;
}
