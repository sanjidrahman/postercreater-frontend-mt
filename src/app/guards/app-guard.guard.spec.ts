import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { appGuardGuard } from './app-guard.guard';

describe('appGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => appGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
