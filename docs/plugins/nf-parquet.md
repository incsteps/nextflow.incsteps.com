# High-Performance Columnar Data for Nextflow

The nf-parquet plugin brings native support for Apache Parquet to the Nextflow ecosystem. As datasets grow in size and complexity, traditional text-based formats like CSV or TSV become bottlenecks. This plugin allows your pipelines to read and write Parquet files seamlessly, unlocking faster processing and significantly lower storage costs.

## Why use Parquet in your pipelines?

Optimized Storage: Parquet’s efficient compression can reduce your storage footprint by up to 90% compared to raw text files.

- Faster I/O: By using columnar storage, Nextflow can read only the columns required for a specific process, drastically reducing disk I/O and memory usage.

- Interoperability: Easily hand over your pipeline results to modern analytical tools like Apache Spark, DuckDB, or AWS Athena without conversion steps.

## Key Features

- Native Channel Integration: Read and write Parquet files directly within your workflows using simple, intuitive operators.

- Schema Inference: Automatically handles data types, ensuring consistency throughout your data transformations.

## Quick Start

To start using nf-parquet, simply add it to your nextflow.config:

```shell
plugins {
    id 'nf-parquet'
}
```

Then, you can handle Parquet data as easily as any other channel:

```shell
workflow {
    Channel.fromPath('large_dataset.parquet')
           .splitParquet()
           | view
}
```

# Need a Custom Implementation?

While nf-parquet is designed for general-purpose high-performance data handling, you might have specific requirements regarding complex nested schemas or integration with private S3-compatible storage.

If you need help optimizing your data architecture or require a specialized version of this plugin for your production environment, we are here to help.

<Chat/>
