import type { Locale } from '../content';
import { content } from '../content';

export type ProjectId = (typeof content.en.projects)[number]['id'];

export function getProjects(locale: Locale) {
  return content[locale].projects;
}
