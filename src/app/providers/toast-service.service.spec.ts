import { TestBed } from '@angular/core/testing';

import { ToastServiceService } from './toast-service.service';

describe('ToastServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ToastServiceService = TestBed.get(ToastServiceService);
    expect(service).toBeTruthy();
  });
});
