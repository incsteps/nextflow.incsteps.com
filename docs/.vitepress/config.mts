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
      //'/plugins/': sidebarPlugins(),
    },
    blog: {
      title: 'Blog',
      description: '',
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
      {},
      `
        (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.eu/embed/embed.js", "init");
        Cal("init", "incsteps", {origin:"https://app.cal.eu"});
        Cal.ns.incsteps("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
      `,
    ],
  ],
})

function nav() {
  return [
    { text: 'Intro', link: '/intro/', activeMatch: '/intro/' },
    { text: 'DevOps', link: '/plugins/', activeMatch: '/plugins/' },
    {
      text: 'Plugins',
      items: [
        {
          text: 'IBM Aspera',
          link: '/plugins/nf-aspera',
        },
        {
          text: 'Parquet',
          link: '/plugins/nf-parquet',
        },
        {
          text: 'CsvExt',
          link: '/plugins/nf-csvext',
        },
      ],
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
  return [
    {
      text: 'Introduction',
      collapsible: true,
    },
  ]
}

