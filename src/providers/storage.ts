import { Injectable } from "@angular/core";
import { ILocale } from "../models/ILocale";
import { IRota } from "../models/IRota";

@Injectable()
export class StorageProvider {

    public databaseLocale = "locale";
    public databaseRota = "rotas";

    getLocale(): Array<ILocale> {
        let lista = JSON.parse(localStorage.getItem(this.databaseLocale));
        return lista ? lista : [];
    }

    setLocale(obj: ILocale) {
        let lista = this.getLocale();
        if (!lista)
            lista = [];

        lista.push(obj);
        localStorage.setItem(this.databaseLocale, JSON.stringify(lista));

        return lista;
    }

    removeLocale(): Array<ILocale> {
        localStorage.removeItem(this.databaseLocale);
        return [];
    }


    getRota(): Array<IRota> {
        let lista = JSON.parse(localStorage.getItem(this.databaseRota));
        return lista ? lista : [];
    }

    setRota(obj: IRota) {
        let lista = this.getRota();
        if (!lista)
            lista = [];

        lista.push(obj);
        localStorage.setItem(this.databaseRota, JSON.stringify(lista));

        return lista;
    }

    removeRota(): Array<IRota> {
        localStorage.removeItem(this.databaseRota);
        return [];
    }

}