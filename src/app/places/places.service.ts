import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place(
      'p1',
      'Manhattan Mansion',
      'In the heart of New York City!',
      'https://static2.mansionglobal.com/production/media/article-images/2f6a5dc3d80ef19f3bc23ddc1e911adf/large_Screen-Shot-2017-12-07-at-12.11.10-PM.png',
      149.99
      ),
      new Place(
        'p2',
        'L\'amour Toujours',
        'A romantic place in Paris!',
        'https://media-cdn.tripadvisor.com/media/photo-s/08/9b/b4/86/paris-house.jpg',
        189.99
      ),
      new Place(
        'p3',
        'The Foggy Palace',
        'Not your average city trip',
        'https://i1.trekearth.com/photos/138102/dsc_0681.jpg',
        99.99
        )
  ];

  get places() {
    return [...this._places];
  }

  constructor() { }

  getPlace(id: string) {
    return {...this.places.find(p => p.id === id)};
  }

}
