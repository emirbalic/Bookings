import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { take, delay, tap, switchMap, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface BookingFireData {
  bookedFrom: Date;
  bookedTo: Date;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}
@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) {}
  get bookings() {
    // return [...this._bookings];
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let fireBaseId: string;
    const booking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userid,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      new Date(dateFrom),
      new Date(dateTo)
    );
    console.log(booking);
    return this.http
      .post<{ name: string }>(
        'https://ionic-booking-6a659.firebaseio.com/bookings.json',
        {
          ...booking,
          id: null
        }
      )
      .pipe(
        switchMap(data => {
          fireBaseId = data.name;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          booking.id = fireBaseId;
          this._bookings.next(bookings.concat(booking));
        })
      );
    // return this.bookings.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(bookings => {
    //     this._bookings.next(bookings.concat(booking));
    //   })
    // );
  }

  fetchBookings() {
    return this.http
      .get<{ [key: string]: BookingFireData }>(
        'https://ionic-booking-6a659.firebaseio.com/bookings.json'
      )
      .pipe(
        map(data => {
          const bookings = [];
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              bookings.push(
                new Booking(
                  key,
                  data[key].placeId,
                  data[key].userId,
                  data[key].placeTitle,
                  data[key].placeImage,
                  data[key].firstName,
                  data[key].lastName,
                  data[key].guestNumber,
                  new Date(data[key].bookedFrom),
                  new Date(data[key].bookedTo)
                )
              );
            }
          }
          // return [];
          return bookings;
        }),
        tap( bookings => {
          this._bookings.next(bookings);
        })
        // looking into data...
        // tap(data => {
        //   console.log(data);
        // })
      );
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this._bookings.next(
          bookings.filter(booking => booking.id !== bookingId)
        );
      })
    );
  }
}
