export type Locale = 'en' | 'es';

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectContent {
  id: 'automation' | 'indexing' | 'cherry' | 'travel';
  title: string;
  category: string;
  description: string;
  contribution: string;
  stack: string[];
  links: ProjectLink[];
  visual: 'automation' | 'indexing' | 'cherry' | 'travel';
}

export interface PortfolioContent {
  nav: { about: string; work: string; contact: string; stack: string };
  skip: string;
  meta: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    intro: string;
    cta: string;
    secondary: string;
    location: string;
  };
  about: { eyebrow: string; title: string; body: string };
  work: {
    eyebrow: string;
    title: string;
    intro: string;
    visit: string;
    label: string;
  };
  projects: ProjectContent[];
  toolkit: {
    eyebrow: string;
    title: string;
    groups: { title: string; items: string[] }[];
  };
  contact: { eyebrow: string; title: string; body: string; emailLabel: string };
  support: { title: string; body: string; disclaimer: string };
  footer: { backToTop: string; note: string };
  portraitAlt: string;
}

export { en } from './en';
export { es } from './es';

import { en } from './en';
import { es } from './es';

export const content: Record<Locale, PortfolioContent> = { en, es };
