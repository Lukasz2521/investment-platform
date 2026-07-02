import { Component } from '@angular/core';

import { HomeAppsShowcase } from './components/home-apps-showcase/home-apps-showcase';
import { HomeFaq } from './components/home-faq/home-faq';
import { HomeHero } from './components/home-hero/home-hero';
import { HomeHowItWorks } from './components/home-how-it-works/home-how-it-works';
import { HomePricingPlans } from './components/home-pricing-plans/home-pricing-plans';
import { HomeWhySeedlee } from './components/home-why-seedlee/home-why-seedlee';

@Component({
  selector: 'app-home',
  imports: [
    HomeHero,
    HomeAppsShowcase,
    HomePricingPlans,
    HomeHowItWorks,
    HomeWhySeedlee,
    HomeFaq,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
