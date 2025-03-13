import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient);
  isFetching = signal(false);
  error = signal('');
  private destoryRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const subscription = this.httpClient
      .get<{ places: Place[] }>('http://localhost:3000/places', {
        observe: 'response',
      })
      .pipe(
        catchError((error) => {
          return throwError(() => new Error('Something Went Wrong'))
        }
        )
      )
      .subscribe({
        next: (response) => {
          console.log(response.body?.places);
          this.places.set(response.body?.places);
        },
        complete: () => {
          this.isFetching.update((prevValue) => !prevValue);
        },
        error: (error: Error) => {
          this.error.set(error.message);
        },
      }); //you need to subscribe in order to trigger the request

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe();
    });
  }


  onSelectPlace(selectedPlace: Place) {
    this.httpClient.put("http://localhost:3000/user-places", {
      placeId: selectedPlace.id
    }).subscribe()

  }
}
