import { TestBed } from '@angular/core/testing';

import { ScriptManageService } from './script-manage.service';

describe('ScriptManageService', () => {
  let service: ScriptManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScriptManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
