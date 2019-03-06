import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';

import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';

interface PlaceFireData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}
@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);
  constructor(private authService: AuthService, private http: HttpClient) {}

  get places() {
    // not returning a copy any more for it is a Subject now
    // return [...this._places];
    // but instead...
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.http
      .get<{ [key: string]: PlaceFireData }>(
        'https://ionic-booking-6a659.firebaseio.com/offered-places.json'
      )
      .pipe(
        map(data => {
          const places = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              places.push(
                new Place(
                  key,
                  data[key].title,
                  data[key].description,
                  data[key].imageUrl,
                  data[key].price,
                  new Date(data[key].availableFrom),
                  new Date(data[key].availableTo),
                  data[key].userId
                )
              );
            }
          }
          return places;
          // return [];
        }),
        tap(places => {
          this._places.next(places);
          // it is like saying ...
          // this._places = places;
        })
      );
  }

  getPlace(placeId: string) {
    return this.http
      .get<PlaceFireData>(
        `https://ionic-booking-6a659.firebaseio.com/offered-places/${placeId}.json`
      )
      .pipe(
        map(data => {
          return new Place(
            placeId,
            data.title,
            data.description,
            data.imageUrl,
            data.price,
            new Date(data.availableFrom),
            new Date(data.availableTo),
            data.userId
          );
        })
        // to 'tap' into the data...
        // tap(place => {
        //   console.log(place);
        // })
      );

    // not working any more 2nd part
    // return this.places.pipe(
    //   take(1),
    //   map(places => {
    //     return { ...places.find(p => p.id === placeId) };
    //   })
    // );
    // not working any more
    // return { ...this._places.find(p => p.id === placeId) };
  }

  // why not - place: Place
  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let firebaseId: string;
    const place = new Place(
      Math.random().toString(),
      title,
      description,
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-86rDItgGyZMjp7R9Z1NLj640No5UjBAoa4_2UmQO60Sd0QhjvA',
      price,
      dateFrom,
      dateTo,
      this.authService.userid
    );
    return this.http
      .post<{ name: string }>(
        'https://ionic-booking-6a659.firebaseio.com/offered-places.json',
        {
          ...place,
          id: null
        }
      )
      .pipe(
        switchMap(data => {
          firebaseId = data.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          place.id = firebaseId;
          this._places.next(places.concat(place));
        })
      );
    // previous but now not tap but update
    // .pipe(tap(data => {
    //   console.log(data);
    // }));

    // this.places.pipe(take(1)).subscribe(places => {
    //   setTimeout(() => {
    //     this._places.next(places.concat(place));
    //   }, 1500);
    // });

    // new version with the tap/rxjs for getting into observable and faking the setTimeout()
    // return this.places.pipe(
    //   take(1),
    //   delay(1500),
    //   tap(places => {
    //     this._places.next(places.concat(place));
    //   })
    // );

    // not working for it is not an array any more
    //  this._places.push(place);
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
          oldPlace.userId
        );
        return this.http.put(
          `https://ionic-booking-6a659.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null }
        );
      }),
      tap(data => {
        this._places.next(updatedPlaces);
      })
    );
  }
}

// dummy
// new Place(
//       '1',
//       'Rome House',
//       'Cool house in suburb',
//       'https://upload.wikimedia.org/wikipedia/commons/f/f7/Woodward%2C_Ashbel%2C_House_%28New_London_County%2C_Connecticut%29.jpg',
//       100,
//       new Date('2019-01-01'),
//       new Date('2019-12-31'),
//       'abc'
//     ),
//     new Place(
//       '2',
//       'Rome Vila',
//       'Modern vila in suburb',
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Gelbensande3.jpg/1200px-Gelbensande3.jpg',
//       200,
//       new Date('2019-01-01'),
//       new Date('2019-12-31'),
//       'abc'
//     ),
//     new Place(
//       '3',
//       'Rome Flat',
//       'Apartment in top floor',
//       'https://i.pinimg.com/originals/af/4d/5f/af4d5fba818cb60e03dd50d816715752.jpg',
//       200,
//       new Date('2019-01-01'),
//       new Date('2019-12-31'),
//       'abc'
//     ),
//     new Place(
//       '4',
//       'Milan Flat',
//       'Apartment in a expensive area',
//       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-86rDItgGyZMjp7R9Z1NLj640No5UjBAoa4_2UmQO60Sd0QhjvA',
//       1000,
//       new Date('2019-01-01'),
//       new Date('2019-12-31'),
//       'abc'
//     ),
//     new Place(
//       '5',
//       'Milan House',
//       'Student house in the center',
//       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJGctIQHwa-fCe-FbIb8yZS0NQx2v1GSHrfQRl0Ih6nTAXc8bt',
//       800,
//       new Date('2019-01-01'),
//       new Date('2019-12-31'),
//       'xyz'
//     )
