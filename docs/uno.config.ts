import {
  defineConfig,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
      unit: 'em',
    }),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
  content: {
    pipeline: {
      include: ['./**/*.vue', './**/*.md'],
    },
  },
  theme: {
    colors: {
      // Definimos la paleta oficial de Nextflow
      nextflow: {
        50: '#e6f6f4',
        100: '#ccece8',
        400: '#00c9a7', // Light
        500: '#00a58b', // Brand / Main
        600: '#00826d', // Dark
      },
    },
  },
})
