import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],

})
export class AvailablePlacesComponent implements OnInit {
  places = signal<Place[] | undefined>(undefined);
  private httpClient = inject(HttpClient)
  isFetching = signal(false)
  private destoryRef = inject(DestroyRef)

  ngOnInit(): void {

    this.isFetching.set(true)
    const subscription = this.httpClient.get<{ places: Place[] }>("http://localhost:3000/places", {
      observe: 'response'
    }).pipe().subscribe(
      {
        next: (response) => {
          console.log(response.body?.places);
          this.places.set(response.body?.places)

        },
        complete: () => {
          this.isFetching.update((prevValue) => !prevValue)
        }
      }
    ) //you need to subscribe in order to trigger the request

    this.destoryRef.onDestroy(() => {
      subscription.unsubscribe()
    })
  }




}
