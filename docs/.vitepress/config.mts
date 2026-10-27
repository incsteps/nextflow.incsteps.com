import type { DefaultTheme } from 'vitepress'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vitepress'
import { plugins } from './nfplugins'

export default defineConfig({
  base: '/',
  description: 'Incremental Steps and Nextflow.',
  ignoreDeadLinks: 'localhostLinks',
  markdown: {
    headers: {
      level: [0, 0],
    },
  },
  themeConfig: {
    footer: {
      message: 'Incremental Steps Software Solutions',
      copyright: 'Copyright © 2026 IncSteps',
    },
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/incsteps' },
    ],
    editLink: {
      pattern: 'https://github.com/incsteps/nextflow-incsteps/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    nav: nav(),
    sidebar: {
      '/intro/': sidebarGuide(),
      '/plugins/': sidebarGuide(),
    },
  },
  title: 'Nextflow',
  vite: {
    plugins: [
      Unocss({
        configFile: '../../unocss.config.ts',
      }),
    ],
  },
  head: [
    [
      'script',
      {
        async: '',
        src: 'https://calendar.incsteps.com/embed.js',
      },
    ],
    [
      'script',
      {},
      `
        var _paq = window._paq = window._paq || [];
        /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
        _paq.push(['trackPageView']);
        _paq.push(['enableLinkTracking']);
        (function() {
          var u="//stats.incsteps.com/";
          _paq.push(['setTrackerUrl', u+'matomo.php']);
          _paq.push(['setSiteId', '1']);
          var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
          g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
        })();
      `,
    ],
  ],
})

function nav(): DefaultTheme.NavItem[] {
  return [
    { text: 'Intro', link: '/intro/', activeMatch: '/intro/' },
    { text: 'DevOps', link: '/devops/', activeMatch: '/devops/' },
    {
      text: 'Plugins',
      items: plugins.map((item) => {
        return {
          text: item.title,
          link: item.link,
        }
      }),
    },
    { text: 'Blog', link: '/blog/', activeMatch: '/blog/' },
    {
      text: 'External Docs',
      items: [
        {
          text: 'Incremental Steps',
          link: 'https://incsteps.com',
        },
      ],
    },
  ]
}

function sidebarGuide() {
  const sidePlugins = plugins.map((plugin) => {
    return {
      text: plugin.title,
      link: plugin.link,
    }
  })
  return [
    {
      text: 'Introduction',
      link: '/intro/',
      collapsible: false,
    },
    {
      text: 'Plugins',
      collapsible: true,
      items: sidePlugins,
    },
  ]
}
