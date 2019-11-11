import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  offers: Place[];
  private placesSub: Subscription;
  isLoading = false;

  constructor(private placesService: PlacesService, private router: Router, loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.offers = places;
    });
  }

  ionViewWillEnter() {
    this.placesService.fetchPlaces().subscribe();
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing item ', offerId, slidingItem);
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}
