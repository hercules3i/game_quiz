import { TestBed } from '@angular/core/testing';

import { NgxCustomTruncateService } from './ngx-custom-truncate.service';

describe('NgxCustomTruncateService', () => {
  let service: NgxCustomTruncateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxCustomTruncateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
