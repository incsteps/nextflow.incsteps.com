# High-Speed Data Transfers for Nextflow

Moving massive datasets across global networks is one of the biggest bottlenecks in modern scientific workflows. The nf-aspera plugin integrates IBM’s FASP (Fast, Adaptive, and Secure Protocol) directly into Nextflow, allowing you to transfer data at maximum speed, regardless of network conditions or distance.

## Why nf-aspera?

- Maximum Bandwidth Utilization: Unlike standard FTP or HTTP, Aspera fills the available bandwidth, achieving speeds up to 100x faster than traditional methods over long distances.

- Resilience: Built to handle high-latency and high-packet-loss networks. If a transfer is interrupted, it resumes exactly where it left off.

-Native Integration: No need for external scripts or manual ascp commands. The plugin handles the complexity of the Aspera transfer engine within your Nextflow logic.

## Key Features

- Secure Transfers: Enterprise-grade security with AES-128 encryption in transit.

- Configurable Throttling: Manage bandwidth allocation to ensure your data moves fast without saturating your entire network.

- Simplified Authentication: Manage your Aspera credentials (SSH keys or passwords) securely through Nextflow’s configuration.

## Quick Start

Add nf-aspera to your nextflow.config:

```shell
plugins {
    id 'nf-aspera'
}
```

```shell
workflow {
    // Downloading files via Aspera protocol
    data_ch = Channel.fromAspera('/remote/path/sample_R1.fastq.gz')
    
    MY_PROCESS(data_ch)
}
```


# Need a Custom Implementation?

At Incremental Steps, we specialize in high-performance connectivity. If you need a custom implementation, help with complex network routing, or specialized Aspera configurations for your hybrid cloud environment, reach out to us.


