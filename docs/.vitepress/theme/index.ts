import type { App } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import AuthorDetail from './components/blog/AuthorDetail.vue'
import Chat from './components/blog/Chat.vue'
import PluginGrid from './components/blog/PluginGrid.vue'
import Post from './components/blog/Post.vue'
import PostAuthor from './components/blog/PostAuthor.vue'
import PostDetail from './components/blog/PostDetail.vue'
import PostIcon from './components/blog/PostIcon.vue'
import Posts from './components/blog/Posts.vue'
import Feature from './components/uno/Feature.vue'
import 'uno.css'
import './custom.css'

export default {
  ...DefaultTheme,
  enhanceApp({ app }: { app: App }) {
    app.component('Feature', Feature)
    app.component('Posts', Posts)
    app.component('Post', Post)
    app.component('PostDetail', PostDetail)
    app.component('PostIcon', PostIcon)
    app.component('PostAuthor', PostAuthor)
    app.component('AuthorDetail', AuthorDetail)
    app.component('Chat', Chat)
    app.component('PluginGrid', PluginGrid)
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'home-hero-info-after': () => h('div', { class: '' }, [h(Chat)]),
    })
  },
}
