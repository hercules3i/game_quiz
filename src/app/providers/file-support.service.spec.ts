import { TestBed } from '@angular/core/testing';

import { FileSupportService } from './file-support.service';

describe('FileSupportService', () => {
  let service: FileSupportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileSupportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
