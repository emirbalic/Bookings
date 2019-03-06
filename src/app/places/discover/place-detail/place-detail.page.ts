import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/booking.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss']
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private subscription: Subscription;
  // userId: string;
  isBookable: boolean;
  isLoading = false;

  constructor(
    // private router: Router,
    private navController: NavController,
    private placesService: PlacesService,
    private activatedRoute: ActivatedRoute,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private bookingService: BookingService,
    private loadingController: LoadingController,
    private authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    // this.userId = this.authService.userid;
    this.activatedRoute.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navController.navigateBack('/places/tabs/discover');
        return;
      }
      // console.log(paramMap.get('placeId'));
      // this.place = this.placesService.getPlace(paramMap.get('placeId'));
      this.isLoading = true;
      this.subscription = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(
          place => {
            this.place = place;
            this.isBookable = place.userId !== this.authService.userid;
            this.isLoading = false;
          },
          error => {
            this.alertController.create({
              header: 'An error occured',
              message: 'Try again later',
              buttons: [
                {
                  text: 'Okay',
                  handler: () => {
                    this.router.navigate(['/places/tabs/discover']);
                  }
                }
              ]
            }).then( alertElement => {
              alertElement.present();
            });
          }
        );
    });
  }
  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navController.navigateBack('/places/tabs/discover');
    this.actionSheetController
      .create({
        header: 'Choose an action',
        animated: true,
        // subHeader: 'Sure',
        translucent: true,
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookModal('select');
            }
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookModal('random');
            }
          },
          {
            text: 'Cancel',
            role: 'cancel'
          }
        ]
      })
      .then(actionSheetElement => {
        actionSheetElement.present();
      });
  }

  openBookModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalController
      .create({
        component: CreateBookingComponent,
        componentProps: { place: this.place, mode: mode }
      })
      .then(modalElement => {
        modalElement.present();
        return modalElement.onDidDismiss();
      })
      .then(data => {
        // console.log(data.data, data.role);
        const dataObject = data.data.bookingData;
        if (data.role === 'confirm') {
          this.loadingController
            .create({
              message: 'Creating booking...'
            })
            .then(loadingElement => {
              loadingElement.present();
              this.bookingService
                .addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  dataObject.firstName,
                  dataObject.lastName,
                  dataObject.guestNumber,
                  dataObject.startDate,
                  dataObject.endDate
                )
                .subscribe(() => {
                  loadingElement.dismiss();
                });
            });
          // console.log('BOOKED');
        }
      });
  }
  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
