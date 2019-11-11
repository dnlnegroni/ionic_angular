import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay,switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PlaceLocation } from './location.model';
import { stringify } from '@angular/compiler/src/util';

// [
//  new Place(
//    'p1',
//    'Manhattan Mansion',
//    'In the heart of New York City!',
//    'https://static2.mansionglobal.com/production/media/article-images/2f6a5dc3d80ef19f3bc23ddc1e911adf/large_Screen-Shot-2017-12-07-at-12.11.10-PM.png',
//    149.99,
//    new Date('2019-01-01'),
//    new Date('2019-12-31'),
//    'abc'
//    ),
//    new Place(
//      'p2',
//      'L\'amour Toujours',
//      'A romantic place in Paris!',
//      'https://media-cdn.tripadvisor.com/media/photo-s/08/9b/b4/86/paris-house.jpg',
//      189.99,
//      new Date('2019-01-01'),
//      new Date('2019-12-31'),
//      'abc'
//    ),
//    new Place(
//      'p3',
//      'The Foggy Palace',
//      'Not your average city trip',
//      'https://i1.trekearth.com/photos/138102/dsc_0681.jpg',
//      99.99,
//      new Date('2019-01-01'),
//      new Date('2019-12-31'),
//      'abc'
//      )
// ]

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  constructor(private authService: AuthService, private http: HttpClient) { }

  private _places = new BehaviorSubject<Place[]>([]);

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.http.get<{[key: string]: PlaceData}>('https://ionic-angular-course-b4443.firebaseio.com/offered-places.json')
    .pipe(map(resData => {
      const places = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          places.push(
            new Place(
              key,
              resData[key].title,
              resData[key].description,
              resData[key].imageUrl,
              resData[key].price,
              new Date(resData[key].availableFrom),
              new Date(resData[key].availableTo),
              resData[key].userId,
              resData[key].location
            )
          );
        }
      }
      return places;
      //return [];
    }),
    tap(places => {
      this._places.next(places);
    }));
  }

  getPlace(id: string) {
    return this.http.get<PlaceData>(
      `https://ionic-angular-course-b4443.firebaseio.com/offered-places/${id}.json`
    ).pipe(
      map(placeData => {
        return new Place(
          id,
          placeData.title,
          placeData.description,
          placeData.imageUrl,
          placeData.price,
          new Date(placeData.availableFrom),
          new Date(placeData.availableTo),
          placeData.userId,
          placeData.location
        );
      })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);
    const httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': 'http://localhost:8100/places/tabs/offers/new',
        'Access-Control-Allow-Methods': 'GET, POST'
      })
    };
    return this.http
    .post<{imageUrl: string, imagePath: string}>
    ('https://us-central1-ionic-angular-course-b4443.cloudfunctions.net/storeImage', uploadData, httpOptions);
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation, imageUrl: string) {
    let generatedId: string;
    let newPlace: Place;
    return this.authService.userId.pipe(take(1), switchMap(userId => {
      if (!userId) {
        throw new Error('No user found!');
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          userId,
          location
        );
        return this.http.post<{name: string}>('https://ionic-angular-course-b4443.firebaseio.com/offered-places.json', 
        {...newPlace, id: null} )
      }
    }), switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
        `https://ionic-angular-course-b4443.firebaseio.com/offered-places/${placeId}.json`,
        {...updatedPlaces[updatedPlaceIndex],  id: null}
        );
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      }));
  }
}
