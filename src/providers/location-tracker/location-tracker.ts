import { Platform } from "ionic-angular";
import { StorageProvider } from "./../storage";
import { Injectable, NgZone } from "@angular/core";
import {
  BackgroundGeolocation,
  BackgroundGeolocationResponse
} from "@ionic-native/background-geolocation";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";
import "rxjs/add/operator/filter";
import { ILocale } from "../../models/ILocale";
import { ICoordenada } from "../../models/ICoordenada";
import { IRota } from "../../models/IRota";

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTracker {
  public watch: any;
  public localizacoes: ILocale[];
  public rota: IRota;
  public localizacao: ILocale = {
    coordenada: null,
    time: null,
    speed: null
  };

  public n: number = 0;

  private configBackgroundGeolocation = {
    notificationTitle: "Localização!!",
    notificationText: "Monitorando sua localização atual!",
    desiredAccuracy: 0,
    stationaryRadius: 10,
    distanceFilter: 15,
    stopOnTerminate: false,
    stopOnStillActivity: false,
    interval: 2000,
    fastestInterval: 2000,
    activitiesInterval: 2000,
    locationProvider: 1,
    pauseLocationUpdates: false,
    debug: false
  };

  private options = {
    frequency: 3000,
    enableHighAccuracy: true
  };

  constructor(
    public platform: Platform,
    public zone: NgZone,
    public backgroundGeolocation: BackgroundGeolocation,
    public geolocation: Geolocation,
    public storageProvider: StorageProvider
  ) {
    this.localizacoes = this.storageProvider.getLocale();
  }

  startTracking() {
    this.stopTracking();

    this.backgroundGeolocation
      .configure(this.configBackgroundGeolocation)
      .subscribe((location: BackgroundGeolocationResponse) => {

        this.localizacao = {
          coordenada: { lat: location.latitude, lng: location.longitude },
          time: location.time,
          speed: location.speed
        };
        this.localizacoes = this.storageProvider
          .setLocale(this.localizacao)
          .reverse();
      });
    this.backgroundGeolocation.start();

    this.watch = this.geolocation
      .watchPosition(this.options)
      .filter((p: any) => p.code === undefined)
      .subscribe((position: Geoposition) => {
        let current = new Date();
        let time = current.getTime();

        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.localizacao = {
            coordenada: { lat: position.coords.latitude, lng: position.coords.longitude },
            time: time,
            speed: position.coords.speed
          };
          this.localizacoes = this.storageProvider
            .setLocale(this.localizacao)
            .reverse();
        });

      });
  }

  stopTracking() {
    if (this.watch) {
      this.watch.unsubscribe();
    }
    this.backgroundGeolocation.stop();
    this.backgroundGeolocation.finish();
  }

  finalizar() {
    let maxPosition = (this.localizacoes.length - 1);
    if (maxPosition != 0) {

      let distancia = 0;

      for (let index = 0; index < maxPosition; index++) {
        if (!this.localizacoes[index + 1]) {
          break;
        }
        distancia += this.getDistanceFromLatLonInKm(this.localizacoes[index], this.localizacoes[index + 1]);
      }

      this.rota = {
        nome: `[${this.n}] Rota`,
        inicio: this.localizacoes[0].time,
        fim: this.localizacoes[maxPosition].time,
        localizacoes: this.localizacoes,
        distancia: distancia
      };
      this.storageProvider.setRota(this.rota);
    }

    this.stopTracking();
    this.localizacoes = this.storageProvider.removeLocale();
  }

  limpar() {
    this.stopTracking();
    this.localizacoes = this.storageProvider.removeLocale();
    this.storageProvider.removeRota();
  }

  private getDistanceFromLatLonInKm(position1, position2): number {
    var deg2rad = function (deg) { return deg * (Math.PI / 180); },
      R = 6371,
      dLat = deg2rad(position2.lat - position1.lat),
      dLng = deg2rad(position2.lng - position1.lng),
      a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
        + Math.cos(deg2rad(position1.lat))
        * Math.cos(deg2rad(position1.lat))
        * Math.sin(dLng / 2) * Math.sin(dLng / 2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c * 1000).toFixed());
  }

}
