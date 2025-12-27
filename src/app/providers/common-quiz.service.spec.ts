import { TestBed } from '@angular/core/testing';

import { CommonQuizService } from './common-quiz.service';

describe('CommonQuizService', () => {
  let service: CommonQuizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonQuizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
