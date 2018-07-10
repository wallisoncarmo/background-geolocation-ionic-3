import { NavController } from "ionic-angular";
import { Component } from "@angular/core";
import { GoogleMaps, GoogleMap, LatLng } from "@ionic-native/google-maps";
import { LocationTracker } from "../../providers/location-tracker/location-tracker";
import { ILocale } from "../../models/ILocale";
import { StorageProvider } from "../../providers/storage";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  map: GoogleMap;
  rotas: ILocale[] = [];
  atual: ILocale = {
    lat: null,
    lng: null
  };

  constructor(
    public navCtrl: NavController,
    public locationTracker: LocationTracker,
    public storageProvider: StorageProvider,
    public geolocation: Geolocation
  ) {
    this.rotas = this.storageProvider.getLocale();
    this.loadMap();
  }

  public start() {
    this.locationTracker.startTracking();
  }

  public stop() {
    this.locationTracker.stopTracking();
    this.loadMap();
    this.rotas = this.storageProvider.getLocale();
  }

  public limpar() {
    this.locationTracker.limpar();
    this.loadMap();
    this.rotas = [];
  }

  public loadMap() {
    let lat: number = -15.8002699;
    let lng: number = -47.8929005;

    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        lat = resp.coords.latitude;
        lng = resp.coords.longitude;
      })
      .catch(error => {
        console.log("Error getting location", error);
      });

    // Create a map after the view is ready and the native platform is ready.
    this.map = GoogleMaps.create("map_canvas", {
      controls: {
        compass: true,
        myLocationButton: true,
        indoorPicker: true,
        zoom: true
      },
      camera: {
        // target: new LatLng(this.atual.lat,this.atual.lng),
        target: new LatLng(lat, lng),
        tilt: 3,
        zoom: 15
      }
    });

    if (this.rotas.length) {
      this.map.addPolyline({
        points: this.rotas,
        geodesic: true,
        clickable: true // clickable = false in default
      });
    }
  }
}
