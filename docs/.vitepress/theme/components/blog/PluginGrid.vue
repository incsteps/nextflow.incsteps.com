<script setup lang="ts">
const plugins = [
  {
    title: 'nf-aspera',
    details: 'High-speed data transfer integration for moving large-scale genomic datasets.',
    link: '/plugins/nf-aspera',
    status: 'New',
  },
  {
    title: 'nf-parquet',
    details: 'Optimized storage patterns to bridge legacy formats with modern big data analytics.',
    link: '/plugins/nf-parquet',
    status: 'Stable',
  },
  {
    title: 'nf-csvext',
    details: 'Advanced CSV parsing and metadata validation for Nextflow pipelines.',
    link: '/plugins/nf-csvext',
    status: 'Stable',
  },
]
</script>

<template>
  <div class="VPFeatures">
    <div class="container">
      <div class="items">
        <div v-for="plugin in plugins" :key="plugin.title" class="item">
          <article class="VPCard">
            <span
              v-if="plugin.status"
              class="top-4 right-4 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded"
              :class="{
                'bg-nextflow-100 text-nextflow-600': plugin.status === 'New',
                'bg-gray-100 text-gray-600': plugin.status === 'Stable',
                'bg-blue-100 text-blue-600': plugin.status === 'Internal'
              }"
            >
              {{ plugin.status }}
            </span>

            <h3 class="m-0 mb-3 text-nextflow-500 font-bold text-xl">{{ plugin.title }}</h3>
            <p class="text-sm text-$vp-c-text-2 leading-relaxed mb-4">{{ plugin.details }}</p>
            <a :href="plugin.link" class="text-sm font-semibold text-nextflow-500 no-underline group-hover:translate-x-1 inline-block transition-transform">
              Learn more →
            </a>

          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.items {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;
}
.item {
  padding: 8px;
  width: 100%;
}
@media (min-width: 640px) { .item { width: calc(100% / 2); } }
@media (min-width: 960px) { .item { width: calc(100% / 3); } }

.VPCard {
  border: 1px solid var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s;
}
.VPCard:hover { border-color: var(--vp-c-brand); }
.title { font-size: 1.2rem; font-weight: 600; margin-bottom: 8px; }
.details { font-size: 0.9rem; color: var(--vp-c-text-2); line-height: 1.5; }
.link { color: var(--vp-c-brand); font-weight: 500; font-size: 0.9rem; text-decoration: none; display: block; margin-top: 12px; }
</style>
