import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { parseString } from 'xml2js';
import { first } from 'lodash';

@Injectable()
export class AreaService {

  constructor(private http: HttpClient) { }

  getAreas(): Observable<Area[]> {
    const httpHeaders = new HttpHeaders().set('Accept', 'application/xml')  ;
    return this.http.get(
      'https://www.finnkino.fi/xml/TheatreAreas/',
      {
        headers: httpHeaders,
        responseType: 'text'
      })
      .switchMap( areas => this.parseAreas(areas))
      .map( areas => areas.slice(1) );
  }

  private parseAreas(areas: string): Observable<Area[]> {
    return Observable.create(observer => {
      parseString(areas, (err, result) => {
        if (err == null) {
          observer.next(this.convertJson(result));
          observer.complete();
        } else {
          observer.error(err);
        }
      });
    });
  }

  private convertJson(json: any): Area[] {
    return json.TheatreAreas.TheatreArea.map( (a: any) => <Area>{id: +first(a.ID), name: first(a.Name)});
  }
}

export interface Area {
 id: number;
 name: string;
}
