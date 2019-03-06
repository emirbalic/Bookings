import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from './booking.service';
import { Booking } from './booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss']
})
export class BookingsPage implements OnInit, OnDestroy {
  bookings: Booking[];
  private subscription: Subscription;
  isLoading = false;

  constructor(
    private bookingService: BookingService,
    private loadingController: LoadingController,
    private router: Router
  ) {}

  ngOnInit() {
    this.subscription = this.bookingService.bookings.subscribe(bookings => {
      this.bookings = bookings;
    });
  }
  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService.fetchBookings().subscribe(() => {
      this.isLoading = false;
    });
  }
  onCancel(bookingId: string, selected: IonItemSliding) {
    selected.close();
    this.loadingController
      .create({
        message: 'Deleting booking...'
      })
      .then(loadingElement => {
        loadingElement.present();
        this.bookingService.cancelBooking(bookingId).subscribe(() => {
          loadingElement.dismiss();
        });
      });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
