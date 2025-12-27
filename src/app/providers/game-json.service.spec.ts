import { TestBed } from '@angular/core/testing';

import { GameJsonService } from './game-json.service';

describe('GameJsonService', () => {
  let service: GameJsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameJsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
