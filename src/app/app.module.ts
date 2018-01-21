import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatSelectModule, MatTableModule, MatSortModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AreaService } from './finnkino/area.service';
import { ScheduleDateService } from './finnkino/schedule-date.service';
import { ScheduleService } from './finnkino/schedule.service';
import { RatingService } from './omdb/rating.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule, HttpClientModule, FormsModule, RouterModule, MatSelectModule, MatTableModule,
    MatSortModule, BrowserAnimationsModule
  ],
  providers: [AreaService, ScheduleDateService, ScheduleService, RatingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
