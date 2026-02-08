import Unocss from 'unocss/vite'
import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/',
  description: 'Incremental Steps and Nextflow.',
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
      '/plugins/': sidebarPlugins(),
    },
    blog: {
      title: 'Blog',
      description: '',
    },

  },
  title: 'IncSteps+Nextflow',
  vite: {
    plugins: [
      Unocss({
        configFile: '../../unocss.config.ts',
      }),
    ],
  },
})

function nav() {
  return [
    { text: 'Intro', link: '/intro/', activeMatch: '/intro/' },
    { text: 'Plugins', link: '/plugins/', activeMatch: '/plugins/' },
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
  return [
    {
      text: 'Introduction',
      collapsible: true,
    },
  ]
}

function sidebarPlugins() {
  return [
    {
      text: 'Plugins',
      items: [
        { text: 'nf-parquet', link: '/plugins/nf-parquet/' },
        { text: 'nf-aspera', link: '/plugins/nf-aspera/' },
      ],
    },
  ]
}
