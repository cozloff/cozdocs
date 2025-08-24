import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Coz Docs',
  tagline: 'Research • Projects • Career',
  favicon: 'img/favicon.ico',

  // Future flags
  future: {
    v4: true,
  },

  url: 'https://cozloff.github.io',
  baseUrl: '/cozdocs/',

  organizationName: 'cozloff',
  projectName: 'cozdocs',
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/cozloff/cozdocs/edit/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
          },
          editUrl: 'https://github.com/cozloff/cozdocs/edit/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      style: 'dark',
      title: 'Dylan Cozloff',
      logo: {
        alt: 'Coz Docs Logo',
        src: 'img/pxArt.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Research & Projects',
        },
        { to: '/blog', label: 'Career', position: 'left' },
        {
          label: 'cozloffd@gmail.com',
          position: 'right',
        },
        {
          href: 'https://github.com/cozloff',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [{ label: 'Research & Projects', to: '/docs/intro' }],
        },
        {
          title: 'Community',
          items: [
            { label: 'YouTube', href: 'https://www.youtube.com/@dylancozloff' },
            { label: 'LinkedIn', href: 'https://linkedin.com/in/dylancozloff' },
            { label: 'X', href: 'https://x.com/dylancozloff' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Career', to: '/blog' },
            { label: 'GitHub', href: 'https://github.com/cozloff' },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Dylan Cozloff`,
    },
    prism: {
      theme: prismThemes.nightOwl,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
