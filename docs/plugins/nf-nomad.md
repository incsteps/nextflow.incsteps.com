---
title: nf-nomad
description: Seamless Nextflow orchestration on HashiCorp Nomad clusters.
---

# nf-nomad

**nf-nomad** enables Nextflow to leverage **HashiCorp Nomad** as a workload orchestrator. 

This plugin is ideal for environments where Kubernetes complexity is not required, but robust, scalable, and lightweight scheduling is essential.

The plugin itself is similar in design and scope to other executor integrations such as nf-azure and k8s, 
however as Nomad (arguably) offers a simpler setup, we aimed to address the usability of a Nomad cluster within the Nextflow ecosystem.

## Key Features

* **Native Job Submission**: Seamlessly dispatch Nextflow tasks as Nomad jobs.
* **Resource Efficiency**: Optimized for low-overhead scheduling in edge or on-premise clusters.
* **Task Driver Support**: Support for Docker, Java, and raw_exec drivers within the Nomad ecosystem.

## Installation

Add the plugin to your `nextflow.config` to start orchestrating with Nomad:

```nextflow
plugins {
    id 'nf-nomad'
}

process {
    executor = 'nomad'
}

nomad{
    client{
        address = "http://localhost:4646"
    }
    jobs{
        deleteoncompletion = false
    }
}
```

# Need a Custom Implementation?

While nf-nomad is designed for a specific use csae, you might have specific requirements regarding how to create and maintain the cluster, for example.

If you need help optimizing your data architecture or require a specialized version of this plugin for your production environment, we are here to help.

<Chat/>

