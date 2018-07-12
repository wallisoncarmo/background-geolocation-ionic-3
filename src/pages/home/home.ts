import { NavController } from "ionic-angular";
import { Component } from "@angular/core";
import {
  GoogleMaps,
  GoogleMap,
  LatLng,
  GoogleMapsEvent,
  HtmlInfoWindow,
  Marker
} from "@ionic-native/google-maps";
import { LocationTracker } from "../../providers/location-tracker/location-tracker";
import { StorageProvider } from "../../providers/storage";
import { Geolocation } from "@ionic-native/geolocation";
import { ICoordenada } from "../../models/ICoordenada";
import { IRota } from "../../models/IRota";
import { ILocale } from "../../models/ILocale";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  map: GoogleMap;
  n: number = 0;
  coordinates: ICoordenada[] = [];
  routers: IRota[] = [];
  router: IRota;
  current: LatLng;
  colors: string[];

  constructor(
    public navCtrl: NavController,
    public locationTracker: LocationTracker,
    public storageProvider: StorageProvider,
    public geolocation: Geolocation
  ) {
    this.colors = [
      "#DC143C",
      "#8A2BE2",
      "#00008B",
      "#006400",
      "#2F4F4F",
      "#000000",
      "#191970"
    ];
    this.loadMap();
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

  public loadMap() {
    this.n = 0;
    this.current = new LatLng(-15.8002699, -47.8929005);
    this.geolocation
      .getCurrentPosition()
      .then(resp => {
        this.current = new LatLng(resp.coords.latitude, resp.coords.longitude);
      })
      .catch(error => {
        console.log("Error getting location", error);
      });

    this.map = GoogleMaps.create("map_canvas", {
      controls: {
        compass: true,
        myLocationButton: true,
        indoorPicker: true,
        zoom: true
      },
      camera: {
        target: this.current,
        tilt: 3,
        zoom: 15
      }
    });

    this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
      this.map.setCameraZoom(18);
      this.map.setCameraTarget(this.current);
    });

    this.addPolyline();
  }

  public addPolyline() {
    this.initRouter();
    this.map.clear();
    if (this.routers.length) {
      this.routers.forEach(rota => {
        this.pushPolyline(rota);
      });
    }
  }

  public pushPolyline(router: IRota) {
    this.pushCoordinates(router);
    this.map.addPolyline({
      points: this.coordinates,
      geodesic: true,
      color: this.colors[this.n]
    });
    this.n = this.n > 7 ? 0 : this.n + 1;

    let max = router.localizacoes.length;
    if (max > 1) {
      this.addMarker(router.localizacoes[0], `[${router.nome}] - Origem`);
      this.addMarker(
        router.localizacoes[max - 1],
        `[${router.nome}] - Destino`
      );
    }
  }

  private pushCoordinates(router: IRota) {
    this.coordinates = [];
    router.localizacoes.forEach(current => {
      this.coordinates.push({
        lat: current.coordenada.lat,
        lng: current.coordenada.lng
      });
    });
  }

  private addMarker(locale: ILocale, titulo: string) {
    this.map
      .addMarker({
        position: locale.coordenada,
        draggable: false,
        disableAutoPan: true,
        icon: {
          size: {
            width: 32,
            height: 32
          },
          url: "./assets/imgs/marker-1.png"
        }
      })
      .then((marker: Marker) => {
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          this.addInfoWindow(locale, titulo).open(marker);
        });
      });
  }

  private addInfoWindow(locale: ILocale, titulo: string): HtmlInfoWindow {
    let htmlInfoWindow = new HtmlInfoWindow();
    let frame: HTMLElement = document.createElement("div");

    frame.innerHTML = [
      `
      <div class="modal" id="modal-name" style="display:block;">
      <div class="modal-sandbox"></div>
      <div class="modal-box">
        <div class="modal-header">
          <div class="close-modal">&#10006;</div>
          <h1>${titulo}</h1>
        </div>
        <div class="modal-body">
          <p>Data e Hora:${this.convertDate(locale.time)}</p>
        </div>
      </div>
    </div>`
    ].join("");

    frame
      .getElementsByClassName("close-modal")[0]
      .addEventListener("click", () => {
        htmlInfoWindow.close();
      });
    htmlInfoWindow.setContent(frame, {});
    return htmlInfoWindow;
  }

  public convertDate(timestamp: number, config = {day:"2-digit",month:"2-digit",year:"2-digit",hour:"2-digit",minute:"2-digit"}) {
    let date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR',config);
  }

  public changeRoute(router:IRota) {
    if (router.nome) {
      this.map.clear();
      this.pushPolyline(this.router);
    }else{
      this.addPolyline();
    }
  }
}
