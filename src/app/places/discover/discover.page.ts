import { Component, OnInit, OnDestroy } from '@angular/core';
import { SegmentChangeEventDetail } from '@ionic/core';

// opening menu programatically
// import { MenuController } from '@ionic/angular';

import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss']
})
export class DiscoverPage implements OnInit, OnDestroy {
  places: Place[];
  listedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private subscription: Subscription;

  constructor(
    private placesService: PlacesService, // , // private menuController: MenuController
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subscription = this.placesService.places.subscribe(places => {
      this.places = places;
      this.relevantPlaces = this.places;
      this.listedPlaces = this.relevantPlaces.slice(1);
    });
    // this.places = this.placesService.getPlaces();
  }
  // opening menu programatically
  // onOpenMenu() {
  //   this.menuController.toggle();
  // }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(()=> {
      this.isLoading = false;
    });
  }

  onFilter(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.places;
      this.listedPlaces = this.relevantPlaces.slice(1);
    } else {
      this.relevantPlaces = this.places.filter(
        place => place.userId !== this.authService.userid
      );
      this.listedPlaces = this.relevantPlaces.slice(1);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
