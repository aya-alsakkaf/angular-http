import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {

  // private httpClient = inject(HttpClient)
  private placesService = inject(PlacesService)
  private destroyRef = inject(DestroyRef)
  isFetching = signal(false);
  error = signal('')
  places = this.placesService.loadedUserPlaces;


  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.placesService.loadUserPlaces().subscribe(
      {

        complete: () => {
          this.isFetching.update((prev) => !prev)
        },
        error: () => {
          this.error.set("Something Went Wrong")
        }
      }
    )

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
    });

  }



}
