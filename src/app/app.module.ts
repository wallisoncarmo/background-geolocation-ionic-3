import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { GoogleMaps } from "@ionic-native/google-maps";
import { Geolocation } from "@ionic-native/geolocation";
import { BackgroundGeolocation } from "@ionic-native/background-geolocation";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Diagnostic } from "@ionic-native/diagnostic";

import { LocationTrackerService } from "../providers/location-tracker/location-tracker-service";
import { StorageService } from "../providers/storage-service";
import { GoogleMapService } from "../providers/google-map/google-map-service";

@NgModule({
  declarations: [MyApp, HomePage],
  imports: [BrowserModule, IonicModule.forRoot(MyApp)],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, HomePage],
  providers: [
    StatusBar,
    GoogleMaps,
    BackgroundGeolocation,
    LocationAccuracy,
    Geolocation,
    SplashScreen,
    Diagnostic,
    LocationTrackerService,
    StorageService,
    GoogleMapService,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule {}
