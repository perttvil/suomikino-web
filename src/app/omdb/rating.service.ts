import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/operator/map';

import { first } from 'lodash';
import { Show } from '../finnkino/schedule.service';

@Injectable()
export class RatingService {
  private cache: any = {};

  constructor(private http: HttpClient) { }

  getRatings(shows: Show[]): Observable<OMDBData[]> {
    const showRatingObservables = shows.map(s => this.getRating(s.originalTitle, s.year));
    return forkJoin(showRatingObservables);
  }

  getRating(name: string, year: number): Observable<OMDBData> {
    const convetedName = this.convertShowNameToOmdb(name);
    const cacheKey = convetedName + year;
    let cachedValue = this.cache[cacheKey];
    if (cachedValue == null) {
      cachedValue = this.getRatingFromServer(convetedName, year);
      this.cache[cacheKey] = cachedValue;
    }
    return cachedValue;
  }

  public convertShowNameToOmdb(name: string): string {
    const forbiddenWords = ['2D', '3D', '4D', '(dub', '(suom', '(international version)', '(international', 'version)'];
    const converted: string = name.split(' ').filter(part => {
      for (const forbiddenWord of forbiddenWords) {
        if (part.indexOf(forbiddenWord) !== -1)
          return false;
      }
      return true;
    }).join(' ');

    if (name !== converted)
      console.log('Converted movie name', name, 'to', converted);
    return converted;
  }
  private getRatingFromServer(name: string, year: number): Observable<OMDBData> {
    console.log('getRatingFromServer', name, year);
    const httpHeaders = new HttpHeaders().set('Accept', 'application/json');
    const httpParams = new HttpParams()
      .set('t', name)
      .set('y', year.toString())
      .set('apikey', 'a367c874');
    return this.http.get<OMDBData>(
      'https://omdbapi.com',
      {
        headers: httpHeaders,
        params: httpParams
      }).map(d => {
        for (const prop in d) {
          if (d[prop] === 'N/A') {
            d[prop] = null;
          }
        }
        return d;
      })
      .publishReplay(1)
      .refCount();
  }
}

export interface OMDBData {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  PlotLong: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID?: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
}
