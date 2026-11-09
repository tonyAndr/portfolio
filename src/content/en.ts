import type { PortfolioContent } from './index';

export const en: PortfolioContent = {
  nav: {
    about: 'About',
    work: 'Selected work',
    contact: 'Contact',
    stack: 'Toolkit',
  },
  skip: 'Skip to content',
  meta: {
    title: 'Anton Andropov — Software Engineer',
    description:
      'Backend-focused software engineer in Málaga building web products, APIs, integrations, and practical AI workflows.',
  },
  hero: {
    eyebrow: 'Software Engineer · Backend & Full Stack',
    headline: 'I build products that connect.',
    intro:
      'I build web products, APIs, and integrations. With 10+ years of experience, I work across TypeScript, Node.js, and PHP, with a focus on reliable backend systems and practical AI workflows.',
    cta: 'Explore selected work',
    secondary: 'Get in touch',
    location: 'Based in Málaga, Spain',
  },
  about: {
    eyebrow: 'A little about me',
    title: 'Product-minded engineering, from backend to interface.',
    body: 'I’m a software engineer based in Málaga, Spain. My work spans commercial web applications, backend services, and the interfaces around them. I combine a long-standing PHP and WordPress background with recent work in TypeScript, NestJS, and Nuxt/Vue. I enjoy connecting APIs, asynchronous processing, external services, and AI integrations to solve practical product needs.',
  },
  work: {
    eyebrow: 'Selected work',
    title: 'Systems, products, and integrations',
    intro:
      'A selection of product development, backend systems, and integrations from my professional work.',
    visit: 'Visit project',
    label: 'Project',
  },
  projects: [
    {
      id: 'automation',
      title: 'AI and CRM automation',
      category: 'Learning Heroes · Education technology',
      description:
        'Contributed to an education platform across backend and frontend, connecting HubSpot and WhatsApp with AI-assisted chatbot workflows.',
      contribution:
        'Built service integrations and asynchronous workflows, including persistent conversation history, call scheduling, ticket escalation, and configurable knowledge bases.',
      stack: [
        'TypeScript',
        'NestJS',
        'Nuxt/Vue',
        'BullMQ',
        'MySQL',
        'Docker',
        'Terraform',
        'AWS',
      ],
      links: [],
      visual: 'automation',
    },
    {
      id: 'indexing',
      title: 'Link indexing platform',
      category: 'Backend and full-stack development',
      description:
        'Developed a link-indexing service with a web application, REST API, Telegram bot, and Chrome extension.',
      contribution:
        'Built Laravel backend functionality, APIs for multiple clients, external integrations, and payment workflows including cryptocurrency payments.',
      stack: [
        'PHP',
        'Laravel',
        'MySQL',
        'Docker',
        'Linux',
        'REST API',
        'Telegram',
      ],
      links: [
        { label: 'Link Indexing Bot', url: 'https://link-indexing-bot.com/' },
        { label: 'Link Indexing Bot RU', url: 'https://link-indexing-bot.ru/' },
      ],
      visual: 'indexing',
    },
    {
      id: 'cherry',
      title: 'CherryLink and SEO tools',
      category: 'Independent product development',
      description:
        'Developed commercial SEO tools and WordPress products, including CherryLink, a plugin for internal linking.',
      contribution:
        'Across this product family, built backend functionality and APIs, worked on React interfaces, and integrated AI embeddings and similarity-scoring features.',
      stack: ['PHP', 'Node.js', 'React', 'WordPress', 'MySQL', 'PostgreSQL'],
      links: [{ label: 'CherryLink', url: 'https://cherrylink.ru/' }],
      visual: 'cherry',
    },
    {
      id: 'travel',
      title: 'Booking and travel applications',
      category: 'Freelance work · Separate projects',
      description:
        'Freelance projects included a custom accommodation booking system, WordPress websites and plugins, and a separate Android app for the Camino de Santiago.',
      contribution:
        'Built custom booking functionality and WordPress work; the travel app included GPS and mapping integrations.',
      stack: ['PHP', 'WordPress', 'Android', 'GPS', 'Maps'],
      links: [{ label: 'Albergue Nájera', url: 'https://alberguenajera.es/' }],
      visual: 'travel',
    },
  ],
  toolkit: {
    eyebrow: 'Tools I use',
    title: 'A practical, flexible toolkit',
    groups: [
      {
        title: 'Backend',
        items: ['TypeScript', 'Node.js', 'NestJS', 'PHP', 'Laravel'],
      },
      {
        title: 'Frontend',
        items: [
          'Nuxt',
          'Vue',
          'React',
          'HTML',
          'CSS',
          'Tailwind CSS',
          'WordPress',
        ],
      },
      {
        title: 'Data & infrastructure',
        items: ['MySQL', 'PostgreSQL', 'Docker', 'AWS', 'Terraform'],
      },
      {
        title: 'Integrations',
        items: ['HubSpot', 'WhatsApp', 'Payment gateways', 'OAuth', 'AI APIs'],
      },
    ],
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Have a project in mind?',
    body: 'For project enquiries or a professional conversation, get in touch by email or find me on GitHub and LinkedIn.',
    emailLabel: 'Email Anton',
  },
  support: {
    title: 'With support from the Junta de Andalucía',
    body: 'My professional activity is subsidised by the Consejería de Empleo, Empresa y Trabajo Autónomo of the Junta de Andalucía.',
    disclaimer:
      'This acknowledgement refers to support for my professional activity and does not imply institutional endorsement of this website or the services presented.',
  },
  footer: { backToTop: 'Back to top', note: 'Designed and built with care.' },
  motion: { pause: 'Pause motion', resume: 'Resume motion' },
  portraitAlt: 'Portrait of Anton Andropov',
};
