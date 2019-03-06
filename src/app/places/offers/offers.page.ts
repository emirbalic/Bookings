import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss']
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading = false;
  private subscription: Subscription;

  constructor(private placesService: PlacesService, private router: Router) {}

  ngOnInit() {
    // this.offers = this.placesService.getPlaces();

    this.subscription = this.placesService.places.subscribe(places => {
      this.offers = places;
    });

  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.subscription = this.placesService.fetchPlaces().subscribe( () => {
      this.isLoading = false;
    });

  }

  onEdit(offerId: string, selected: IonItemSliding) {
    selected.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing: ' + offerId);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
