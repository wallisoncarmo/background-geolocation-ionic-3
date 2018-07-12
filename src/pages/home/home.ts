import { NavController } from "ionic-angular";
import { Component } from "@angular/core";
import { LocationTrackerService } from "../../providers/location-tracker/location-tracker-service";
import { StorageService } from "../../providers/storage-service";
import { Geolocation } from "@ionic-native/geolocation";
import { IRota } from "../../models/IRota";
import { GoogleMapService } from "../../providers/google-map/google-map-service";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  n: number = 0;
  routers: IRota[] = [];
  router: IRota;

  constructor(
    public navCtrl: NavController,
    public locationTracker: LocationTrackerService,
    public storageProvider: StorageService,
    public geolocation: Geolocation,
    public googleMapService: GoogleMapService
  ) {
    this.initRouter();
    this.googleMapService.loadMap("map_canvas", this.routers);
  }

  public initRouter() {
    this.n = 0;
    this.routers = this.storageProvider.getRouter();
  }

  public start() {
    this.locationTracker.startTracking();
  }

  public stop() {
    this.n = 0;
    this.locationTracker.stopTracking();
    this.addPolyline();
  }

  public finish() {
    this.n = 0;
    this.locationTracker.finish();
    this.addPolyline();
  }

  public clearAll() {
    this.n = 0;
    this.locationTracker.clearAll();
    this.addPolyline();
  }

  public clear() {
    this.n = 0;
    this.locationTracker.clear();
    this.addPolyline();
  }

  public addPolyline() {
    this.initRouter();
    this.googleMapService.addPolyline(this.routers);
  }

  public changeRoute(router: IRota) {
    if (router.nome) {
      this.googleMapService.clearMap();
      this.googleMapService.pushPolyline(this.router);
    } else {
      this.googleMapService.addPolyline(this.initRouter());
    }
  }
}
