---
date: 2024-08-30
title: Executing Nextflow pipelines with Nomad by Hashicorp
category: executors, pipelines, nomad
tags: nomad
author: Jorge Aguilera
---

Nomad is a simple and flexible scheduler and orchestrator to deploy and manage containers and non-containerized applications across on-premises and clouds at scale.

---

In this post, I’ll explore how to use a Nomad cluster to run Nextflow pipelines.


<PostDetail>


## About Nomad

In some ways, Nomad is an alternative to Kubernetes (and similar orchestrators) without its complexity. 
You can create a cluster of low-resources machines and Nomad orchestrates how/where deploy your workloads.

Workloads are defined in Nomad by a Job witch contains 1 or more TaskGroup, and every TaskGroup contains 1 or more Task. 
This task can be a Jar application, a system process or a Docker image

Also, you can share volumes across your cluster. These volumes can be a local folder, in case you have only one machine, 
or use some of the available plugins to share CSI volumes as NFS, etc.

## About nf-nomad

As you can imagine, this is enough to run Nextflow pipelines (a container orchestrator and shared volumes) and 
the "only" missing piece is some Nextflow Executor to submit tasks into the cluster and control their execution and 
this missing piece is the nf-nomad plugin

nf-nomad is a new Nextflow plugin, similar to the nf-k8s kubernetes plugin, implementing the bridge logic between Nextflow and Nomad.

When you execute a pipeline in Nextflow using this plugin as executor, it will translate, 
create and submit the Nextflow process to the cluster the Nomad Job specification.

Once submitted, the plugin will maintain the status of every task in the Nexflow session.

The plugin is open source, and you can find it at https://github.com/nextflow-io/nf-nomad

## Running a Nomad Cluster

Install and run a Nomad cluster it’s as easy as download and execute the binary from the official website. 
In the same way, configure and attach clients to the cluster are straightforward, and it only requires a text configuration file.

For simplicity, In this post, we’ll create a cluster with only one machine on (our computer). We’ll use, also, a local folder as shared volume.

Steps in this post have been tested using a Linux machine, not sure if they will work on a Mac. Surely it will not work in a Windows OS

Download the Git repo https://github.com/nextflow-io/nf-nomad and unzip it (or clone with git clone) in some folder

Open a terminal console and navigate to the validation sub-folder and run on it:

./start-nomad.sh

This sh will perform the following steps:

    download the nomad binary from the official website

    create a server and a client configuration files

    create a nomad_temp folder and configure it as a "shared" volume called scratchdir

    run the nomad executable

If all goes well, you have running a Nomad cluster into your computer. You see the UI at http://localhost:4646/

## Running a "hello world" pipeline

In this validation folder you can find several pipelines examples. They are used to validate different plugin features.

We’ll try to run a simple "hello world" nextflow pipeline.

Open a terminal console and navigate to the validation sub-folder and run on it:

    export NOMAD_PLUGIN_VERSION=0.2.0
    nextflow run -w $(pwd)/nomad_temp/scratchdir/ -c basic/nextflow.config basic/main.nf

(0.2.0. is Last version at this moment)

This post assumes you have nextflow 24.x.x installed in your PATH

Using the NOMAD_PLUGIN_VERSION environment variable, we instruct to basic/nextflow.config about which version we want to use. Feel free to use a fixed value in basic/nextflow.config

If all goes well, you will see the typical `Bonjour world', 'Ciao world', 'Hello world', 'Hola world' output

basic/main.nf is the typical Nextflow "hello world", nothing special here.

basic/nextflow.config configures nomad as the default executor. Also, it contains the minimal configuration required by the plugin:

```nextflow
process {
    executor = "nomad"
}

nomad {
    client {
        address = "http://localhost:4646"
    }
    jobs {
    volume = { type "host" name "scratchdir" }
    }
}
```

As you can see, the plugin requires the endpoint to the cluster (localhost in our case) and a volume to attach to the Job. 
This volume was created previously by the start-nomad.sh. In a more realistic situation probably this volume will be a 
csi type nf-core/demo

In the same terminal and in the validation folder run:

```
export NXF_ASSETS=$(pwd)/nomad_temp/scratchdir/assets
export NXF_CACHE_DIR=$(pwd)/nomad_temp/scratchdir/cache
nextflow run -w $(pwd)/nomad_temp/scratchdir/ -c basic/nextflow.config nf-core/demo -profile test,docker --outdir $(pwd)/nomad_temp/scratchdir/outdir

....
* Software dependencies
  https://github.com/nf-core/demo/blob/master/CITATIONS.md
------------------------------------------------------
executor >  nomad (7)
[21/35f6ba] process > NFCORE_DEMO:DEMO:FASTQC (SAMPLE1_PE)     [100%] 3 of 3 ✔
[9b/5e0157] process > NFCORE_DEMO:DEMO:SEQTK_TRIM (SAMPLE3_SE) [100%] 3 of 3 ✔
[da/0eadbc] process > NFCORE_DEMO:DEMO:MULTIQC                 [100%] 1 of 1 ✔
-[nf-core/demo] Pipeline completed successfully-
```

if all goes well, you’ll be able to see the nf-core/demo outputs at ./nomad_temp/scratchdir/outdir/pipeline_info folder
Volumes

In all these examples, we’ve used a local folder as a shared volume between our nextflow command line and containers 
created into the nomad cluster. 

However, you can also use a S3 bucket (with wave+fusion), or install some of the available Nomad plugins and mount an NFS server, for example.

nf-nomad plugin allows also mounting more than one volume:

```
jobs {
    volumes = [
        { type "host" name "scratchdir" },
        { type "host" name "scratchdir" path "/var/data" },  // can mount same volume in different path
    ]
}
```

## Delete Jobs

Using the jobs.deleteOnCompletion boolean configuration you can specify if the jobs are removed once completed or 
maintain them for posterior inspection (using the nomad UI for example)

## Secrets

One feature of Nomad is to store variables into the cluster (and configure which roles can access to them,) 
and you can use them in your Job definition avoiding using fixed values into it.

nf-nomad plugin use this feature to provide a Nextflow SecretsProvider as a bridge between your pipelines and these variables:

Create a key=value variable into the cluster using the nomad cli.

`./nomad var put secrets/nf-nomad/MY_ACCESS_KEY MY_ACCESS_KEY=TheAccessKey`

use this variable as a secret into your pipeline

```
workflow.onComplete {
    println("The secret is: ${secrets.MY_ACCESS_KEY}")
}
```

    INFO

    The start-nomad.sh shell create a namespace and two variables. You can see how to use them in the secrets/main.nf pipeline

## Stop and clean

Stop the cluster is so easy as kill the nomad process. You can use the stop-nomad.sh shell to do it and clean the temporal folder


## Configuration

Using the nomad closure you can configure different aspects of the plugin as:

- endpoint to the cluster
- access token (in case you’ve protected the access with a token)
- list of datacenters to use
- region where allocate jobs
- namespace to use in jobs
- list of volume specs
- list of affinities and constraints
- attempts in case of failure


Also, in current version, some of them can be overwritten using environment variables:

- NOMAD_ADDRESS
- NOMAD_TOKEN
- NOMAD_DC (datacenters)
- NOMAD_REGION
- NOMAD_NAMESPACE

## Raspberry Pi

As a side/fun note, I would like to comment I was able to run the bactopia pipeline in a raspberry pi attached to the cluster
Conclusion

At this moment the plugin is in version 0.2.0 and it is being testing by the Universitey Gent team.

The Current version covers almost all the requirements to run typical pipelines, but surely new features will be included in the plugin


</PostDetail>
