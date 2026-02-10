---
title: nf-csvext
description: Extended CSV manipulation utilities for Nextflow pipelines.
---

# nf-csvext

**nf-csvext** is a Nextflow plugin designed to streamline CSV file manipulation and transformation directly within your workflow. It eliminates the need for intermediate scripting steps (Python/Bash) by providing native operators for common data cleaning and formatting tasks.

## Key Features

The plugin exposes a set of functions following the `csv_xxxx` pattern for intuitive data handling:

* **`csv_sort`**: Emits a CSV sorted by a specific column name or index.
* **`csv_trim`**: Removes unnecessary columns from a CSV to optimize data flow.
* **`csv_concat`**: Concatenates multiple CSV files while ensuring header integrity.
* **`csv_create`**: A powerful operator (similar to `collectFiles`) to generate dynamic CSVs from channel items.
* **`csv_prettyprint`**: Rewrites a CSV with adjusted column widths for better human readability.

---

## Installation

To enable these features, add the plugin ID to your `nextflow.config` file:

```nextflow
plugins {
    id "nf-csvext@0.2.0"
}
```

## Usage Examples

Sorting and Filtering (Sort & Trim)

Ideal for preparing sample sheets before they enter compute-intensive processes:

```nextflow
include { csv_sort; csv_trim } from 'plugin/nf-csvext'

workflow {
    Channel.fromPath(params.input)
        | map { source -> csv_sort(source, column: 'sample_id') }
        | map { sorted -> csv_trim(sorted, columns: 'old_metadata,raw_index') }
        | splitCsv(header: true)
        | view
}
```

## General Specifications

Performance: The plugin uses local temporary storage for processing, ensuring high performance even with large datasets.

Flexibility: Most functions accept an optional Map to configure separators (sep), headers, and temporary directories.

# Need a Custom Implementation?

While nf-parquet is designed for general-purpose high-performance data handling, you might have specific requirements regarding complex nested schemas or integration with private S3-compatible storage.

If you need help optimizing your data architecture or require a specialized version of this plugin for your production environment, we are here to help.

<Chat/>
