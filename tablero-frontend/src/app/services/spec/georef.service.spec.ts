import { TestBed } from '@angular/core/testing';

import { GeorefService } from '../georef.service';

describe('ReservaService', () => {
  let service: GeorefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeorefService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
