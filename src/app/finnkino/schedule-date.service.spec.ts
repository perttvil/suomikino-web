import { TestBed, inject } from '@angular/core/testing';

import { ScheduleDateService } from './schedule-date.service';

describe('ScheduleDateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScheduleDateService]
    });
  });

  it('should be created', inject([ScheduleDateService], (service: ScheduleDateService) => {
    expect(service).toBeTruthy();
  }));
});
