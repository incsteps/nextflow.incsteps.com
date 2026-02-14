export interface NfPlugin {
  title: string
  details: string
  link: string
  status: string
}

export const plugins = [
  {
    title: 'nf-nomad',
    details: 'Nextflow orchestration on HashiCorp Nomad clusters.',
    link: '/plugins/nf-nomad',
    status: 'Stable',
  },
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
