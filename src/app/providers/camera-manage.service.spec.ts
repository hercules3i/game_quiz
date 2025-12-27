import { TestBed } from '@angular/core/testing';

import { CameraManageService } from './camera-manage.service';

describe('CameraManageService', () => {
  let service: CameraManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CameraManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
