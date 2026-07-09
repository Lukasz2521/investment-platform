import { PartnershipCategory } from './partnership-categories';

export interface PartnershipDetailBlock {
  titleKey: string;
  bodyKey: string;
  image?: string;
  imageAltKey?: string;
}

export interface PartnershipProject {
  id: string;
  category: Exclude<PartnershipCategory, 'all'>;
  clientKey: string;
  titleKey: string;
  image: string;
  imageAltKey: string;
  detailIntroKey: string;
  detailOutroTitleKey: string;
  detailOutroKey: string;
  detailBlocks: PartnershipDetailBlock[];
}

const DETAIL = '/images/partnerships/detail';

export const PARTNERSHIP_PROJECTS: PartnershipProject[] = [
  {
    id: 'tough-cookies',
    category: 'brandedContent',
    clientKey: 'marketing.partnerships.projects.toughCookies.client',
    titleKey: 'marketing.partnerships.projects.toughCookies.title',
    image: '/images/partnerships/tough-cookies.jpg',
    imageAltKey: 'marketing.partnerships.projects.toughCookies.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.toughCookies.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.toughCookies.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.toughCookies.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.toughCookies.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.toughCookies.detail.block1.body',
        image: `${DETAIL}/tough-cookies-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.toughCookies.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.toughCookies.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.toughCookies.detail.block2.body',
        image: `${DETAIL}/tough-cookies-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.toughCookies.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.toughCookies.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.toughCookies.detail.block3.body',
        image: '/images/partnerships/tough-cookies.jpg',
        imageAltKey: 'marketing.partnerships.projects.toughCookies.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'gilles-villeneuve',
    category: 'designBranding',
    clientKey: 'marketing.partnerships.projects.gillesVilleneuve.client',
    titleKey: 'marketing.partnerships.projects.gillesVilleneuve.title',
    image: '/images/partnerships/gilles-villeneuve.jpg',
    imageAltKey: 'marketing.partnerships.projects.gillesVilleneuve.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block1.body',
        image: `${DETAIL}/gilles-villeneuve-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block2.body',
      },
      {
        titleKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block3.body',
        image: '/images/partnerships/gilles-villeneuve.jpg',
        imageAltKey: 'marketing.partnerships.projects.gillesVilleneuve.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'rona',
    category: 'advertising',
    clientKey: 'marketing.partnerships.projects.rona.client',
    titleKey: 'marketing.partnerships.projects.rona.title',
    image: '/images/partnerships/rona.jpg',
    imageAltKey: 'marketing.partnerships.projects.rona.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.rona.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.rona.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.rona.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.rona.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.rona.detail.block1.body',
        image: `${DETAIL}/rona-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.rona.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.rona.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.rona.detail.block2.body',
        image: `${DETAIL}/rona-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.rona.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.rona.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.rona.detail.block3.body',
        image: '/images/partnerships/rona.jpg',
        imageAltKey: 'marketing.partnerships.projects.rona.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'iga-avatars',
    category: 'experiential',
    clientKey: 'marketing.partnerships.projects.igaAvatars.client',
    titleKey: 'marketing.partnerships.projects.igaAvatars.title',
    image: '/images/partnerships/iga-avatars.jpg',
    imageAltKey: 'marketing.partnerships.projects.igaAvatars.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.igaAvatars.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.igaAvatars.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.igaAvatars.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.igaAvatars.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.igaAvatars.detail.block1.body',
        image: `${DETAIL}/iga-avatars-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.igaAvatars.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.igaAvatars.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.igaAvatars.detail.block2.body',
        image: `${DETAIL}/iga-avatars-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.igaAvatars.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.igaAvatars.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.igaAvatars.detail.block3.body',
        image: '/images/partnerships/iga-avatars.jpg',
        imageAltKey: 'marketing.partnerships.projects.igaAvatars.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'loto',
    category: 'digital',
    clientKey: 'marketing.partnerships.projects.loto.client',
    titleKey: 'marketing.partnerships.projects.loto.title',
    image: '/images/partnerships/loto.jpg',
    imageAltKey: 'marketing.partnerships.projects.loto.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.loto.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.loto.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.loto.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.loto.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.loto.detail.block1.body',
        image: `${DETAIL}/loto-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.loto.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.loto.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.loto.detail.block2.body',
        image: `${DETAIL}/loto-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.loto.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.loto.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.loto.detail.block3.body',
        image: '/images/partnerships/loto.jpg',
        imageAltKey: 'marketing.partnerships.projects.loto.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'tfo',
    category: 'digital',
    clientKey: 'marketing.partnerships.projects.tfo.client',
    titleKey: 'marketing.partnerships.projects.tfo.title',
    image: '/images/partnerships/tfo.jpg',
    imageAltKey: 'marketing.partnerships.projects.tfo.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.tfo.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.tfo.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.tfo.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.tfo.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.tfo.detail.block1.body',
        image: `${DETAIL}/tfo-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.tfo.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.tfo.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.tfo.detail.block2.body',
      },
      {
        titleKey: 'marketing.partnerships.projects.tfo.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.tfo.detail.block3.body',
        image: '/images/partnerships/tfo.jpg',
        imageAltKey: 'marketing.partnerships.projects.tfo.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'resorts-world',
    category: 'experiential',
    clientKey: 'marketing.partnerships.projects.resortsWorld.client',
    titleKey: 'marketing.partnerships.projects.resortsWorld.title',
    image: `${DETAIL}/resorts-world-1.jpg`,
    imageAltKey: 'marketing.partnerships.projects.resortsWorld.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.resortsWorld.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.resortsWorld.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.resortsWorld.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.resortsWorld.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.resortsWorld.detail.block1.body',
        image: `${DETAIL}/resorts-world-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.resortsWorld.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.resortsWorld.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.resortsWorld.detail.block2.body',
      },
      {
        titleKey: 'marketing.partnerships.projects.resortsWorld.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.resortsWorld.detail.block3.body',
        image: '/images/partnerships/resorts-world.png',
        imageAltKey: 'marketing.partnerships.projects.resortsWorld.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'cheekbone',
    category: 'designBranding',
    clientKey: 'marketing.partnerships.projects.cheekbone.client',
    titleKey: 'marketing.partnerships.projects.cheekbone.title',
    image: '/images/partnerships/cheekbone.jpg',
    imageAltKey: 'marketing.partnerships.projects.cheekbone.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.cheekbone.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.cheekbone.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.cheekbone.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.cheekbone.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.cheekbone.detail.block1.body',
        image: `${DETAIL}/cheekbone-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.cheekbone.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.cheekbone.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.cheekbone.detail.block2.body',
      },
      {
        titleKey: 'marketing.partnerships.projects.cheekbone.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.cheekbone.detail.block3.body',
        image: '/images/partnerships/cheekbone.jpg',
        imageAltKey: 'marketing.partnerships.projects.cheekbone.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'hogwarts',
    category: 'brandedContent',
    clientKey: 'marketing.partnerships.projects.hogwarts.client',
    titleKey: 'marketing.partnerships.projects.hogwarts.title',
    image: '/images/partnerships/hogwarts.jpg',
    imageAltKey: 'marketing.partnerships.projects.hogwarts.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.hogwarts.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.hogwarts.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.hogwarts.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.hogwarts.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.hogwarts.detail.block1.body',
        image: `${DETAIL}/hogwarts-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.hogwarts.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.hogwarts.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.hogwarts.detail.block2.body',
      },
      {
        titleKey: 'marketing.partnerships.projects.hogwarts.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.hogwarts.detail.block3.body',
        image: '/images/partnerships/hogwarts.jpg',
        imageAltKey: 'marketing.partnerships.projects.hogwarts.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'canadiens',
    category: 'brandedContent',
    clientKey: 'marketing.partnerships.projects.canadiens.client',
    titleKey: 'marketing.partnerships.projects.canadiens.title',
    image: '/images/partnerships/canadiens.jpg',
    imageAltKey: 'marketing.partnerships.projects.canadiens.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.canadiens.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.canadiens.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.canadiens.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.canadiens.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.canadiens.detail.block1.body',
        image: `${DETAIL}/canadiens-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.canadiens.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.canadiens.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.canadiens.detail.block2.body',
        image: `${DETAIL}/canadiens-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.canadiens.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.canadiens.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.canadiens.detail.block3.body',
        image: '/images/partnerships/canadiens.jpg',
        imageAltKey: 'marketing.partnerships.projects.canadiens.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'linkbuds',
    category: 'advertising',
    clientKey: 'marketing.partnerships.projects.linkbuds.client',
    titleKey: 'marketing.partnerships.projects.linkbuds.title',
    image: '/images/partnerships/linkbuds.jpg',
    imageAltKey: 'marketing.partnerships.projects.linkbuds.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.linkbuds.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.linkbuds.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.linkbuds.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.linkbuds.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.linkbuds.detail.block1.body',
        image: `${DETAIL}/linkbuds-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.linkbuds.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.linkbuds.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.linkbuds.detail.block2.body',
        image: `${DETAIL}/linkbuds-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.linkbuds.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.linkbuds.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.linkbuds.detail.block3.body',
        image: '/images/partnerships/linkbuds.jpg',
        imageAltKey: 'marketing.partnerships.projects.linkbuds.detail.block3.imageAlt',
      },
    ],
  },
  {
    id: 'callisto',
    category: 'brandedContent',
    clientKey: 'marketing.partnerships.projects.callisto.client',
    titleKey: 'marketing.partnerships.projects.callisto.title',
    image: '/images/partnerships/callisto.jpg',
    imageAltKey: 'marketing.partnerships.projects.callisto.imageAlt',
    detailIntroKey: 'marketing.partnerships.projects.callisto.detail.intro',
    detailOutroTitleKey: 'marketing.partnerships.projects.callisto.detail.outroTitle',
    detailOutroKey: 'marketing.partnerships.projects.callisto.detail.outro',
    detailBlocks: [
      {
        titleKey: 'marketing.partnerships.projects.callisto.detail.block1.title',
        bodyKey: 'marketing.partnerships.projects.callisto.detail.block1.body',
        image: `${DETAIL}/callisto-1.jpg`,
        imageAltKey: 'marketing.partnerships.projects.callisto.detail.block1.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.callisto.detail.block2.title',
        bodyKey: 'marketing.partnerships.projects.callisto.detail.block2.body',
        image: `${DETAIL}/callisto-2.jpg`,
        imageAltKey: 'marketing.partnerships.projects.callisto.detail.block2.imageAlt',
      },
      {
        titleKey: 'marketing.partnerships.projects.callisto.detail.block3.title',
        bodyKey: 'marketing.partnerships.projects.callisto.detail.block3.body',
        image: '/images/partnerships/callisto.jpg',
        imageAltKey: 'marketing.partnerships.projects.callisto.detail.block3.imageAlt',
      },
    ],
  },
];

export function getPartnershipProject(id: string): PartnershipProject | undefined {
  return PARTNERSHIP_PROJECTS.find((project) => project.id === id);
}

export function getAdjacentPartnershipProjects(id: string): {
  previous?: PartnershipProject;
  next?: PartnershipProject;
} {
  const index = PARTNERSHIP_PROJECTS.findIndex((project) => project.id === id);

  if (index === -1) {
    return {};
  }

  return {
    previous: index > 0 ? PARTNERSHIP_PROJECTS[index - 1] : undefined,
    next: index < PARTNERSHIP_PROJECTS.length - 1 ? PARTNERSHIP_PROJECTS[index + 1] : undefined,
  };
}
