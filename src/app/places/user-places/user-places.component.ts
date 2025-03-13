import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { HttpClient } from '@angular/common/http';
import { Place } from '../place.model';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {

  private httpClient = inject(HttpClient)
  private destroyRef = inject(DestroyRef)
  places = signal<Place[] | undefined>(undefined);
  isFetching = signal(false);
  error = signal('')


  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.httpClient.get<{ places: Place[] }>("http://localhost:3000/user-places", {
      observe: 'response'
    }).subscribe(
      {
        next: (response) => {
          console.log("userplaces", response)
          this.places.set(response.body?.places)
        },
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
