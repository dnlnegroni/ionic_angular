import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Renderer2, OnDestroy, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map', {static: false}) mapElementRef: ElementRef;
  clickListener: any;
  googleMaps: any;
  @Input() center = {lat: 41.891946, lng: 12.427126};
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  constructor(private modalCtrl: ModalController, private render: Renderer2) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.getGoogleMaps().then(googleMaps => {
      this.googleMaps = googleMaps;
      const mapEl = this.mapElementRef.nativeElement;
      const map = new googleMaps.Map(mapEl, {
        center: this.center,
        zoom: 16
      });
      this.googleMaps = googleMaps.event.addListenerOnce(map, 'idle', () => {
        this.render.addClass(mapEl, 'visible');
      });
      if (this.selectable) {
        this.clickListener = map.addListener('click', event => {
          const selectedCoords = {lat: event.latLng.lat(), lng: event.latLng.lng()};
          this.modalCtrl.dismiss(selectedCoords);
        });
      } else {
        const marker = new googleMaps.Marker({
          position: this.center,
          map,
          title: 'Picked Location'
        });
        marker.setMap(map);
      }
    }).catch(err => {
      console.log(err);
    });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    /*if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }*/
  }

  private getGoogleMaps() {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps){
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://maps.googleapis.com/maps/api/js?key=' + environment.googleMapsAPIKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogle = win.google;
        if (loadedGoogle && loadedGoogle.maps) {
          resolve(loadedGoogle.maps);
        } else {
          reject('Google maps SDK not available!');
        }
      }
    });
  }

}
