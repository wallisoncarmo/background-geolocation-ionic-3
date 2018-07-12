import { ICoordenada } from "./ICoordenada";

export interface ILocale {
  coordenada: ICoordenada;
  time: number;
  speed: number;
  bateria?: number;
}
