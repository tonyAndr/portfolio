import type { PortfolioContent } from './index';

export const es: PortfolioContent = {
  nav: {
    about: 'Sobre mí',
    work: 'Proyectos',
    contact: 'Contacto',
    stack: 'Tecnologías',
  },
  skip: 'Saltar al contenido',
  meta: {
    title: 'Anton Andropov — Ingeniero de software',
    description:
      'Ingeniero de software en Málaga especializado en backend, productos web, APIs, integraciones y aplicaciones prácticas de IA.',
  },
  hero: {
    eyebrow: 'Ingeniero de software · Backend y full stack',
    headline: 'Creo productos que conectan.',
    intro:
      'Desarrollo productos web, APIs e integraciones. Con más de 10 años de experiencia, trabajo con TypeScript, Node.js y PHP, con especial atención a sistemas backend fiables y flujos de trabajo prácticos con IA.',
    cta: 'Ver proyectos',
    secondary: 'Contactar',
    location: 'Vivo en Málaga, España',
  },
  about: {
    eyebrow: 'Un poco sobre mí',
    title: 'Ingeniería de producto, del backend a la interfaz.',
    body: 'Soy ingeniero de software y vivo en Málaga. Mi experiencia abarca aplicaciones web comerciales, servicios backend y sus interfaces. Combino una amplia trayectoria con PHP y WordPress con trabajo reciente en TypeScript, NestJS y Nuxt/Vue. Me interesa conectar APIs, procesamiento asíncrono, servicios externos e integraciones de IA para resolver necesidades reales de producto.',
  },
  work: {
    eyebrow: 'Proyectos destacados',
    title: 'Sistemas, productos e integraciones',
    intro:
      'Una selección de desarrollo de producto, sistemas backend e integraciones de mi trayectoria profesional.',
    visit: 'Visitar proyecto',
    label: 'Proyecto',
  },
  projects: [
    {
      id: 'automation',
      title: 'Automatización con IA y CRM',
      category: 'Learning Heroes · Tecnología educativa',
      description:
        'Contribuí al backend y frontend de una plataforma educativa, conectando HubSpot y WhatsApp con flujos de chatbot asistidos por IA.',
      contribution:
        'Desarrollé integraciones y procesos asíncronos, con historial persistente de conversaciones, programación de llamadas, escalado de incidencias y bases de conocimiento configurables.',
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
      title: 'Plataforma de indexación de enlaces',
      category: 'Desarrollo backend y full stack',
      description:
        'Desarrollé un servicio de indexación de enlaces con aplicación web, API REST, bot de Telegram y extensión de Chrome.',
      contribution:
        'Implementé funcionalidades backend con Laravel, APIs para varios clientes, integraciones externas y flujos de pago, incluidos pagos con criptomonedas.',
      stack: [
        'PHP',
        'Laravel',
        'MySQL',
        'Docker',
        'Linux',
        'API REST',
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
      title: 'CherryLink y herramientas SEO',
      category: 'Desarrollo de productos independiente',
      description:
        'Desarrollé herramientas SEO comerciales y productos para WordPress, entre ellos CherryLink, un plugin de enlazado interno.',
      contribution:
        'En esta familia de productos desarrollé funcionalidades backend y APIs, trabajé en interfaces con React e integré embeddings de IA y funciones de cálculo de similitud.',
      stack: ['PHP', 'Node.js', 'React', 'WordPress', 'MySQL', 'PostgreSQL'],
      links: [{ label: 'CherryLink', url: 'https://cherrylink.ru/' }],
      visual: 'cherry',
    },
    {
      id: 'travel',
      title: 'Aplicaciones de reservas y viajes',
      category: 'Trabajo freelance · Proyectos distintos',
      description:
        'Mis proyectos freelance incluyen un sistema de reservas de alojamiento a medida, sitios y plugins de WordPress, y una aplicación Android independiente para el Camino de Santiago.',
      contribution:
        'Desarrollé funcionalidades de reserva y proyectos con WordPress; la aplicación de viajes incluía integraciones de GPS y mapas.',
      stack: ['PHP', 'WordPress', 'Android', 'GPS', 'Mapas'],
      links: [{ label: 'Albergue Nájera', url: 'https://alberguenajera.es/' }],
      visual: 'travel',
    },
  ],
  toolkit: {
    eyebrow: 'Herramientas',
    title: 'Un conjunto de herramientas práctico y flexible',
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
        title: 'Datos e infraestructura',
        items: ['MySQL', 'PostgreSQL', 'Docker', 'AWS', 'Terraform'],
      },
      {
        title: 'Integraciones',
        items: [
          'HubSpot',
          'WhatsApp',
          'Pasarelas de pago',
          'OAuth',
          'APIs de IA',
        ],
      },
    ],
  },
  contact: {
    eyebrow: 'Contacto',
    title: '¿Tienes un proyecto en mente?',
    body: 'Si quieres hablar sobre un proyecto o contactar conmigo por motivos profesionales, escríbeme por correo o búscame en GitHub y LinkedIn.',
    emailLabel: 'Escribir a Anton',
  },
  support: {
    title: 'Con el apoyo de la Junta de Andalucía',
    body: 'Esta actividad está subvencionada por la Consejería de Empleo, Empresa y Trabajo Autónomo de la Junta de Andalucía.',
    disclaimer:
      'Este reconocimiento se refiere al apoyo a mi actividad profesional y no implica un aval institucional de este sitio web ni de los servicios presentados.',
  },
  footer: {
    backToTop: 'Volver arriba',
    note: 'Diseñado y desarrollado con cuidado.',
  },
  motion: { pause: 'Pausar animación', resume: 'Reanudar animación' },
  portraitAlt: 'Retrato de Anton Andropov',
};
