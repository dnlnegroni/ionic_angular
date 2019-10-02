import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>(
    [
      new Place(
        'p1',
        'Manhattan Mansion',
        'In the heart of New York City!',
        'https://static2.mansionglobal.com/production/media/article-images/2f6a5dc3d80ef19f3bc23ddc1e911adf/large_Screen-Shot-2017-12-07-at-12.11.10-PM.png',
        149.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
        ),
        new Place(
          'p2',
          'L\'amour Toujours',
          'A romantic place in Paris!',
          'https://media-cdn.tripadvisor.com/media/photo-s/08/9b/b4/86/paris-house.jpg',
          189.99,
          new Date('2019-01-01'),
          new Date('2019-12-31'),
          'abc'
        ),
        new Place(
          'p3',
          'The Foggy Palace',
          'Not your average city trip',
          'https://i1.trekearth.com/photos/138102/dsc_0681.jpg',
          99.99,
          new Date('2019-01-01'),
          new Date('2019-12-31'),
          'abc'
          )
    ]
  );

  get places() {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) { }

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map(places => {
        return {...places.find(p => p.id === id)};
      })
    );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://i1.trekearth.com/photos/138102/dsc_0681.jpg',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
    return this.http.post('https://ionic-angular-course-b4443.firebaseio.com/offered-places.json', {
      ...newPlace, id: null
    }).pipe(tap(resData => {
      console.log(resData);
    }));

    // return this.places.pipe(
    //  take(1),
    //  delay(1000),
    //  tap(places => {
    //    this._places.next(places.concat(newPlace));
    //  })
    // );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(take(1), delay(1000), tap(places => {
      const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[updatedPlaceIndex];
      updatedPlaces[updatedPlaceIndex] = new Place(
        oldPlace.id,
        oldPlace.title,
        oldPlace.description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId
      );
      this._places.next(updatedPlaces);
    }));
  }
}
