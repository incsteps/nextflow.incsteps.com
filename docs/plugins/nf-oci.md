---
title: nf-oci
description: New FileSystem for Oracle Cloud
---

# nf-oci

The nf-oci plugin brings native Oracle Cloud Infrastructure support to the Nextflow ecosystem. 

It implements a dedicated file system provider that allows users to interact with OCI Object Storage using a standardized protocol.


## Quick Start

To start using nf-oci, simply add it to your nextflow.config:

```shell
plugins {
    id 'nf-oci'
}
```

Then, you can read data from your bucket:

```shell
workflow {
    Channel.fromPath('oci://my-bucket/my-file.txt')
           | view
}
```

# Need a Custom Implementation?

While nf-oci is designed for Oracle Cloud users, you might have specific requirements regarding complex nested schemas or integration with private S3-compatible storage.

If you need help optimizing your data architecture or require a specialized version of this plugin for your production environment, we are here to help.

<Chat/>
