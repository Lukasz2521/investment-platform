import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { TranslationService } from './core/i18n/services/translation.service';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        {
          provide: TranslationService,
          useValue: {
            init: () => Promise.resolve(),
            activeLanguage: signal('pl'),
            languages: [{ code: 'pl', label: 'Polski' }],
            setLanguage: () => Promise.resolve(),
            translate: (key: string) => key,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
