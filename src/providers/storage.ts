import { Injectable } from "@angular/core";
import { ILocale } from "../models/ILocale";

@Injectable()
export class StorageProvider {

    public database = "locale";

    getLocale(): Array<ILocale> {
        let lista = JSON.parse(localStorage.getItem(this.database));
        return lista ? lista : [];
    }

    setLocale(obj: ILocale) {

        let lista = this.getLocale();
        if (!lista)
            lista = [];

        lista.push(obj);
        localStorage.setItem(this.database, JSON.stringify(lista));

        return lista;
    }

    removeLocale(): Array<ILocale> {
        localStorage.removeItem(this.database);
        return [];
    }

}