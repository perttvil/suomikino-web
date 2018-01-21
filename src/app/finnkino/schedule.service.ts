import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/publishReplay';
import { Observable } from 'rxjs/Observable';
import { parseString } from 'xml2js';
import { first } from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Area } from '../finnkino/area.service';
import { OMDBData } from '../omdb/rating.service';

@Injectable()
export class ScheduleService {
  private cache: any = {};
  constructor(private http: HttpClient) { }

  getSchedule(area: Area, date: Moment): Observable<Show[]> {
    const cacheKey = area.id + date.toString();
    let cachedValue = this.cache[cacheKey];
    if (cachedValue == null) {
      cachedValue = this.getScheduleFromServer(area, date);
      this.cache[cacheKey] = cachedValue;
    }
    return cachedValue;
  }

  getScheduleFromServer(area: Area, date: Moment): Observable<Show[]> {
    console.log('getScheduleFromServer', area.name, date.format('DD.MM.YYYY'));
    const httpHeaders = new HttpHeaders().set('Accept', 'application/xml');
    const params = new HttpParams().set('area', area.id.toString()).set('dt', date.format('DD.MM.YYYY'));
    return this.http.get(
      'https://www.finnkino.fi/xml/Schedule/',
      {
        headers: httpHeaders,
        params: params,
        responseType: 'text'
      })
      .switchMap(data => this.parseXml(data))
      .publishReplay(1)
      .refCount();
  }

  private parseXml(data: string): Observable<Show[]> {
    return Observable.create(observer => {
      parseString(data, (err, result) => {
        if (err == null) {
          observer.next(this.convertJson(result));
          observer.complete();
        } else {
          observer.error(err);
        }
      });
    });
  }

  private convertJson(data: any): Show[] {
    return first<any>(data.Schedule.Shows)
      .Show.map(json =>
        <Show>{
          id: +first(json.ID),
          title: first(json.Title),
          originalTitle: first(json.OriginalTitle),
          showStart: moment(first(json.dttmShowStartUTC)),
          showEnd: moment(first(json.dttmShowEndUTC)),
          year: +first(json.ProductionYear),
          lenghtMin: +first(json.LengthInMinutes),
          releaseDate: moment(first(json.dtLocalRelease)),
          eventType: first(json.EventType),
          genre: first(json.Genres),
          theatre: first(json.Theatre),
          theatreAuditorium: first(json.TheatreAndAuditorium),
          presentationMethodAndLanguage: first(json.PresentationMethodAndLanguage)
    });
  }
}
export interface Show {
  id: number;
  title: string;
  originalTitle: string;
  showStart: Moment;
  showEnd: Moment;
  year: number;
  lenghtMin: number;
  releaseDate: Moment;
  eventType: string;
  genre: string;
  theatre: string;
  theatreAuditorium: string;
  presentationMethodAndLanguage: string;
  omdbData?: OMDBData;
}
