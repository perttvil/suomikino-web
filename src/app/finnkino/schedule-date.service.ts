import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/publishReplay';
import { Observable } from 'rxjs/Observable';
import { parseString } from 'xml2js';
import { first } from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';

@Injectable()
export class ScheduleDateService {
  private cache: any = {};

  constructor(private http: HttpClient) { }

  getDatesForArea(areaId: number): Observable<Moment[]> {
    const cacheKey = areaId;
    let cachedValue = this.cache[cacheKey];
    if (cachedValue == null) {
      cachedValue = this.getDatesForAreaFromServer(areaId);
      this.cache[cacheKey] = cachedValue;
    }
    return cachedValue;
  }

  getDatesForAreaFromServer(areaId: number): Observable<Moment[]> {
    console.log('getDatesForAreaFromServer', areaId);
    const httpHeaders = new HttpHeaders().set('Accept', 'application/xml');
    return this.http.get(
      'https://www.finnkino.fi/xml/ScheduleDates/',
      {
        headers: httpHeaders,
        responseType: 'text'
      })
      .switchMap(dates => this.parseDates(dates))
      .publishReplay(1)
      .refCount();
  }

  private parseDates(dates: string): Observable<Moment[]> {
    return Observable.create(observer => {
      parseString(dates, (err, result) => {
        if (err == null) {
          observer.next(this.convertJson(result));
          observer.complete();
        } else {
          observer.error(err);
        }
      });
    });
  }

  private convertJson(json: any): Moment[] {
    return json.Dates.dateTime.map( str => moment(str));
  }
}
