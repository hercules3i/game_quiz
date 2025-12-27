import { TestBed } from '@angular/core/testing';

import { ChatWebsyncService } from './chat-websync.service';

describe('ChatWebsyncService', () => {
  let service: ChatWebsyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatWebsyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
