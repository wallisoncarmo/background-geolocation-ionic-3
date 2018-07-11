import { ILocale } from "./ILocale";

export interface  IRota{
    nome:string;
    inicio:number;
    fim:number;
    distancia:number;
    localizacoes:ILocale[];
}
