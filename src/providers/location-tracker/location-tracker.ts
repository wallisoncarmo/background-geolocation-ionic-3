import { Platform, ToastController } from "ionic-angular";
import { StorageProvider } from "./../storage";
import { Injectable, NgZone } from "@angular/core";
import {
  BackgroundGeolocation,
  BackgroundGeolocationResponse
} from "@ionic-native/background-geolocation";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";
import "rxjs/add/operator/filter";
import { ILocale } from "../../models/ILocale";
import { IRota } from "../../models/IRota";

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTracker {
  public watch: any;
  public active: boolean = false;
  public locales: ILocale[];
  public router: IRota;
  public locale: ILocale = {
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
    public storageProvider: StorageProvider,
    public toastController: ToastController
  ) {
    this.locales = this.storageProvider.getLocale();
  }

  public startTracking() {
    this.stopTracking();

    this.backgroundGeolocation
      .configure(this.configBackgroundGeolocation)
      .subscribe((location: BackgroundGeolocationResponse) => {
        this.zone.run(() => {
          this.locale = {
            coordenada: { lat: location.latitude, lng: location.longitude },
            time: location.time,
            speed: location.speed
          };

          if (this.validDistance(this.locale))
            this.locales = this.storageProvider.setLocale(this.locale);
        });
      });
    this.backgroundGeolocation.start();
    this.active = true;

    this.watch = this.geolocation
      .watchPosition(this.options)
      .filter((p: any) => p.code === undefined)
      .subscribe((position: Geoposition) => {
        let current = new Date();
        let time = current.getTime();

        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.locale = {
            coordenada: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            },
            time: time,
            speed: position.coords.speed
          };

          if (this.validDistance(this.locale))
            this.locales = this.storageProvider.setLocale(this.locale);
        });

        console.log("locales", this.locales);
      });
  }

  public stopTracking() {
    if (this.active) {
      this.watch.unsubscribe();
      this.backgroundGeolocation.finish();
      this.backgroundGeolocation.stop();
      this.active = false;
    }
  }

  public finish() {
    this.stopTracking();

    let maxPosition = this.locales.length - 1;
    if (maxPosition >= 0) {
      let distancia = 0;

      for (let index = 0; index < maxPosition; index++) {
        if (!this.locales[index + 1]) {
          break;
        }
        distancia += this.getDistanceFromLatLonInKm(
          this.locales[index].coordenada,
          this.locales[index + 1].coordenada
        );
      }

      this.router = {
        nome: `[${this.n}] Rota`,
        inicio: this.locales[0].time,
        fim: this.locales[maxPosition].time,
        localizacoes: this.locales,
        distancia: distancia
      };
      this.storageProvider.setRouter(this.router);
    }

    this.locales = this.storageProvider.removeLocale();
  }

  public clearAll() {
    this.clear();
    this.storageProvider.removeRouter();
  }

  public clear() {
    this.stopTracking();
    this.locales = this.storageProvider.removeLocale();
  }

  private getDistanceFromLatLonInKm(position1, position2): number {
    var deg2rad = function(deg) {
        return deg * (Math.PI / 180);
      },
      R = 6371,
      dLat = deg2rad(position2.lat - position1.lat),
      dLng = deg2rad(position2.lng - position1.lng),
      a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(position1.lat)) *
          Math.cos(deg2rad(position1.lat)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2),
      c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c * 1000).toFixed());
  }

  private validDistance(locale: ILocale) {
    let max = this.locales.length;

    if (max > 1) {
      let dtIni, dtEnd;
      dtEnd = new Date(this.locales[max - 1].time);
      dtIni = new Date(locale.time);
      let distance = this.getDistanceFromLatLonInKm(
        locale.coordenada,
        this.locales[max - 1].coordenada
      );

      if (distance > 10 && this.timePeriod(dtIni, dtEnd) < 3) {
        return false;
      }
    }

    return true;
  }

  private timePeriod(dtIni, dtEnd): number {
    return Math.round((dtEnd - dtIni) / 60 / 60);
  }

  private validGPS() {
    return true;
  }
}
