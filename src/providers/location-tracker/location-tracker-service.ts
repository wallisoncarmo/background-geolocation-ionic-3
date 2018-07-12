import { Platform, ToastController } from "ionic-angular";
import { Injectable, NgZone } from "@angular/core";
import {
  BackgroundGeolocation,
  BackgroundGeolocationResponse
} from "@ionic-native/background-geolocation";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";
import "rxjs/add/operator/filter";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Diagnostic } from "@ionic-native/diagnostic";
import { BatteryStatus } from "@ionic-native/battery-status";

import { ILocale } from "../../models/ILocale";
import { IRota } from "../../models/IRota";
import { StorageService } from "../storage-service";

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTrackerService {
  public watch: any;
  public active: boolean = false;
  public locales: ILocale[];
  public router: IRota;
  public batteryService: any;
  public batteryValue: any;
  public locale: ILocale = {
    coordenada: null,
    time: null,
    speed: null
  };
  public gpsOffs: ILocale[];
  public gpsOff: ILocale = {
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
    public storageService: StorageService,
    public toastController: ToastController,
    public locationAccuracy: LocationAccuracy,
    public diagnostic: Diagnostic,
    private batteryStatus: BatteryStatus
  ) {
    this.locales = this.storageService.getLocale();
  }

  public startTracking() {
    this.stopTracking();
    this.ativarGPS();

    this.batteryService = this.batteryStatus.onChange().subscribe(status => {
      this.batteryValue = status.level;
      console.log(status.level, status.isPlugged);
    });
    this.diagnostic.registerLocationStateChangeHandler(state =>
      this.validGPS()
    );

    this.backgroundGeolocation
      .configure(this.configBackgroundGeolocation)
      .subscribe((location: BackgroundGeolocationResponse) => {
        this.locale = {
          coordenada: { lat: location.latitude, lng: location.longitude },
          time: location.time,
          speed: location.speed,
          bateria: this.batteryValue
        };

        console.log("locale", this.locale);

        if (this.validDistance(this.locale)) {
          this.locales = this.storageService.setLocale(this.locale);
        }

        // this.zone.run(
        //   () => {
        //   },
        //   error => {
        //     console.error(error);
        //   }
        // );
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
        this.locale = {
          coordenada: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          time: time,
          speed: position.coords.speed,
          bateria: this.batteryValue
        };

        console.log("locales", this.locales);

        if (this.validDistance(this.locale)) {
          this.locales = this.storageService.setLocale(this.locale);
        }

        // this.zone.run(
        //   () => {
        //   },
        //   error => {
        //     console.error(error);
        //   }
        // );
      });
  }

  public stopTracking() {
    if (this.active) {
      this.watch.unsubscribe();
      this.backgroundGeolocation.finish();
      this.backgroundGeolocation.stop();
      this.active = false;
      this.batteryService.unsubscribe();
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
        distancia: distancia,
        gpsOff: this.gpsOffs
      };
      this.storageService.setRouter(this.router);
    }

    this.locales = this.storageService.removeLocale();
    this.locales = this.storageService.removeGPSOff();
  }

  public clearAll() {
    this.clear();
    this.storageService.removeRouter();
  }

  public clear() {
    this.stopTracking();
    this.locales = this.storageService.removeLocale();
    this.storageService.removeGPSOff();
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

    console.log("max", max);

    if (max > 1) {
      let dtIni, dtEnd;
      dtIni = new Date(this.locales[max - 1].time);
      dtEnd = new Date(locale.time);
      let distance = this.getDistanceFromLatLonInKm(
        locale.coordenada,
        this.locales[max - 1].coordenada
      );
      if (distance > 200 && this.timePeriod(dtIni, dtEnd) < 3) {
        return false;
      }
    }

    return true;
  }

  private timePeriod(dtIni, dtEnd): number {
    return Math.round((dtEnd - dtIni) / 60 / 60);
  }

  public validGPS(): Promise<any> {
    return this.diagnostic
      .isGpsLocationEnabled()
      .then(state => {
        let max = this.locales.length;
        if (!state && max > 0) {
          this.gpsOffs = this.storageService.setGPSOff(this.locale);
          this.ativarGPS();
        }
        return state;
      })
      .catch(e => console.error(e));
    // return false;
  }

  public ativarGPS() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy
          .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
          .then(
            () => console.log("Request successful"),
            error => {
              console.log("Error requesting location permissions", error);
              this.ativarGPS();
            }
          );
      }
    });
  }
}
