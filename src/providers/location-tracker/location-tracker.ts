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

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTracker {
  public watch: any;
  public localizacoes: ILocale[];
  public localizacao: ILocale = {
    lat: null,
    lng: null
  };

  public notificationAlreadyReceived = false;
  public originalCoords;
  public DISTANCE_TO_MOVE = 0.003069;
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
          lat: location.latitude,
          lng: location.longitude
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
        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.localizacao = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
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

  limpar() {
    this.stopTracking();
    this.localizacoes = this.storageProvider.removeLocale();
  }
}
