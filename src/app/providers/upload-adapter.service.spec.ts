import { TestBed } from '@angular/core/testing';

import { UploadAdapterService } from './upload-adapter.service';

describe('UploadAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UploadAdapterService = TestBed.get(UploadAdapterService);
    expect(service).toBeTruthy();
  });
});
