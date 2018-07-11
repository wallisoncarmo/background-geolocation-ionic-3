import { Injectable } from "@angular/core";
import { ILocale } from "../models/ILocale";
import { IRota } from "../models/IRota";

@Injectable()
export class StorageProvider {

    public databaseLocale = "locale";
    public databaseRouter = "routers";

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


    getRouter(): Array<IRota> {
        let lista = JSON.parse(localStorage.getItem(this.databaseRouter));
        return lista ? lista : [];
    }

    setRouter(obj: IRota) {
        let lista = this.getRouter();
        if (!lista)
            lista = [];

        lista.push(obj);
        localStorage.setItem(this.databaseRouter, JSON.stringify(lista));

        return lista;
    }

    removeRouter(): Array<IRota> {
        localStorage.removeItem(this.databaseRouter);
        return [];
    }

}
