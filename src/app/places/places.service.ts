import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private userPlaces = signal<Place[]>([]);
  private httpClient = inject(HttpClient);
  loadedUserPlaces = this.userPlaces.asReadonly();
  private errorService = inject(ErrorService)
  private fetchPlaces(url: string, errorMessage: string) {
    return this.httpClient.get<{ places: Place[] }>(url).pipe(
      map((res) => res.places),
      catchError((error) => {
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  loadAvailablePlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/places',
      'Something Went Wrong Fetchig The Available Places'
    );
  }

  loadUserPlaces() {
    return this.fetchPlaces(
      'http://localhost:3000/user-places',
      'Something Went Wrong Fetching Your Favorite Places'
    ).pipe(
      tap({
        next: (response) => this.userPlaces.set(response),
      })
    );
  }

  addPlaceToUserPlaces(place: Place) {
    const prevPlaces = this.userPlaces();

    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.set([...prevPlaces, place]);
    }
    return this.httpClient
      .put('http://localhost:3000/user-places', {
        placeId: place.id,
      })
      .pipe(
        catchError((error) => {
          this.userPlaces.set(prevPlaces); //rolling back to previous version
          this.errorService.showError('Failed To Store Selected Place')
          return throwError(() => new Error('Failed To Store Selected Place'));
        })
      );
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces()

    if (prevPlaces.some((p) => p.id === place.id)) {
      const updatedPlaces = prevPlaces.filter((p) => p.id !== place.id)
      this.userPlaces.set(updatedPlaces);
    }
    return this.httpClient.delete(`http://localhost:3000/user-places/${place.id}`).pipe(
      catchError((error) => {
        this.userPlaces.set(prevPlaces); //rolling back to previous version
        this.errorService.showError('Failed To Remove Selected Place')
        return throwError(() => new Error('Failed To Remove Selected Place'));
      })
    );
  }
}
