export type ContactOffice = {
  id: string;
  cityKey: string;
  imageSrc: string;
  imageAltKey: string;
  /** Physical address only — no email / phone (as on sidlee.com/en/meet-us). */
  addressLines: string[];
};

export const CONTACT_OFFICES: ContactOffice[] = [
  {
    id: 'montreal',
    cityKey: 'marketing.contact.offices.montreal.city',
    imageSrc: '/images/contact/offices/montreal.jpg',
    imageAltKey: 'marketing.contact.offices.montreal.imageAlt',
    addressLines: [
      '12102-1 Place Ville Marie',
      'Montreal, Quebec H3B 3Y1',
      'Canada',
    ],
  },
  {
    id: 'toronto',
    cityKey: 'marketing.contact.offices.toronto.city',
    imageSrc: '/images/contact/offices/toronto.jpg',
    imageAltKey: 'marketing.contact.offices.toronto.imageAlt',
    addressLines: ['946 Queen St. W.', 'Toronto, Ontario, M6J 1G8', 'Canada'],
  },
  {
    id: 'los-angeles',
    cityKey: 'marketing.contact.offices.losAngeles.city',
    imageSrc: '/images/contact/offices/los-angeles.jpg',
    imageAltKey: 'marketing.contact.offices.losAngeles.imageAlt',
    addressLines: [
      '9046 Lindblade Street',
      'Culver City, California 90232',
      'United States',
    ],
  },
  {
    id: 'paris',
    cityKey: 'marketing.contact.offices.paris.city',
    imageSrc: '/images/contact/offices/paris.jpg',
    imageAltKey: 'marketing.contact.offices.paris.imageAlt',
    addressLines: ['Paris', 'France'],
  },
  {
    id: 'new-york',
    cityKey: 'marketing.contact.offices.newYork.city',
    imageSrc: '/images/contact/offices/new-york.jpg',
    imageAltKey: 'marketing.contact.offices.newYork.imageAlt',
    addressLines: [
      '395 Hudson Street, 8th floor',
      'New York, NY, 10014',
      'United States',
    ],
  },
  {
    id: 'london',
    cityKey: 'marketing.contact.offices.london.city',
    imageSrc: '/images/contact/offices/london.jpg',
    imageAltKey: 'marketing.contact.offices.london.imageAlt',
    addressLines: [
      '5th and 6th Floor',
      'Herbal House',
      '8 Back Hill',
      'London, EC1R 5EN',
      'United Kingdom',
    ],
  },
];
