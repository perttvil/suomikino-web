import { Component, AfterViewInit, ViewChild, OnInit, NgZone, SimpleChanges } from '@angular/core';
import { AreaService, Area } from './finnkino/area.service';
import { ScheduleDateService } from './finnkino/schedule-date.service';
import { ScheduleService, Show } from './finnkino/schedule.service';
import { first } from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';
import { MatTable, MatTableDataSource, MatSort } from '@angular/material';
import { RatingService, OMDBData } from './omdb/rating.service';
import { OnChanges } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnChanges {
  title = 'app';
  public areas: Area[];
  public selectedArea: Area;
  public dates: Moment[];
  public selectedDate: string;
  public shows: Show[];
  public omdbData: OMDBData[];

  public displayedColumns = ['originalTitle', 'releaseDate', 'showStart', 'imdb', 'metascore'];
  public dataSource = new MatTableDataSource();
  @ViewChild(MatSort) sort: MatSort;

  constructor(private areaService: AreaService,
    private scheduleDateService: ScheduleDateService,
    private scheduleService: ScheduleService,
    private ratingService: RatingService,
    private ngZone: NgZone) {
  }

  ngOnInit() {
    console.log('ngOnInit');
    this.loadAreas();
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges');
  }

  private initSelectBoxes() {
    console.log('initSelectBoxes', this.selectedArea, this.selectedDate);
    if (this.selectedArea == null && this.areas != null) {
      this.selectedArea = this.areas.find(a => a.id === 1021);
      this.areaChanged();
    }
    if (this.selectedDate == null && this.dates != null) {
      this.selectedDate = first(this.dates).format('DD.MM.YYYY');
    }
    if (this.selectedArea != null && this.selectedDate != null) {
      this.loadShows(this.selectedArea, this.selectedDate);
    }
  }

  areaChanged() {
    console.log('areaChanged', this.selectedArea);
    this.loadDates(this.selectedArea.id);
  }

  dateChanged() {
    console.log('dateChanged', this.selectedDate);
    this.loadShows(this.selectedArea, this.selectedDate);
  }

  private loadAreas() {
    console.log('loadAreas');
    this.areaService.getAreas().subscribe(
      data => this.setAreas(data)
    );
  }

  private setAreas(areas: Area[]) {
    this.ngZone.run( () => {
      this.areas = areas;
      this.initSelectBoxes();
    });
  }

  private loadDates(areaId: number) {
    console.log('loadDates()', areaId);
    this.scheduleDateService.getDatesForArea(areaId).subscribe(
      dates => this.setDates(dates)
    );
  }

  private setDates(dates: Moment[]) {
    this.ngZone.run( () => {
      this.dates = dates;
      this.initSelectBoxes();
    });
  }

  private loadShows(area: Area, date: string) {
    console.log('loadShows()', area, date);
    this.scheduleService.getSchedule(area, moment(date, 'DD.MM.YYYY')).subscribe(
      shows => this.setShows(shows)
    );
  }

  private setShows(shows: Show[]) {
    this.ngZone.runGuarded( () => {
      this.shows = shows;
      this.dataSource.data = this.shows;
      this.dataSource.sort = this.sort;
      // this.dataSource.data = this.shows;
      this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
    });
    this.ratingService.getRatings(this.shows)
      .subscribe(ratings =>
        this.setOMDBDataToShows(this.shows, ratings));
  }

  private setOMDBDataToShows(shows: Show[], omdbData: OMDBData[]) {
    this.ngZone.run( () => {
      this.omdbData = omdbData;
      shows.forEach(s => {
        s.omdbData = omdbData.find(d => this.ratingService.convertShowNameToOmdb(s.originalTitle) === d.Title);
      });
    });
  }

  sortingDataAccessor(data: Show, sortHeaderId: string) {
    switch (sortHeaderId) {
      case 'imdb': return data.omdbData ? data.omdbData.imdbRating : null;
      case 'metascore': return data.omdbData ? data.omdbData.Metascore : null;
      default: return data[sortHeaderId];
    }
  }
}
