---
date: 2026-05-22
title: Deploying a Nomad Cluster for Dev
category: Article
tags: nomad,executors, pipelines, nomad
author: Jorge Aguilera
---

In this post, I’ll explore how to create a Dev environment with Nomad and Minio to deploy fully functional Nextflow pipelines

---

<PostDetail>


## About Nomad

Nomad is a simple and flexible scheduler and orchestrator to deploy and manage containers and non-containerized applications across on-premises and clouds at scale.

In some ways, Nomad is an alternative to Kubernetes (and similar orchestrators) without its complexity.
You can create a cluster of low-resources machines and Nomad orchestrates how/where deploy your workloads.

Workloads are defined in Nomad by a Job witch contains 1 or more TaskGroup, and every TaskGroup contains 1 or more Task.
This task can be a Jar application, a system process or a Docker image


## About Minio

Minio is an Open Source software to deploy a custom S3 (AWS) in your infrastructure. You're the owner of the data,
and you can create as much buckets you want plus users, tokens, etc.

# Multipass

Multipass is a tool to generate cloud-style Ubuntu VMs quickly on Linux, macOS and Windows. 
It provides a simple but powerful CLI that enables you to quickly access an Ubuntu command line or create your own local mini-cloud.


## The idea

In this tutorial we'll create a Linux VM instance using Multipass and we'll deploy a dev stack with Nomad and Minio.

Once completed we'll be able to run Nextflow pipelines as we're using a cloud solution but with the advantage all
the data will be hosted in our infra (in my case in my laptop)

## Creating the VM

I'll assume you're running this tutorial in a Ubuntu machine with enough memory and disk. 

First step is to create a virtual machine:

`multipass launch --name nomad --memory 8gb --disk 50gb lts`

After a few minutes Multipass has been created and started an Ubuntu machine. 

`multipass list`

```aiignore
Name                    State             IPv4             Image
nomad                   Running           10.182.220.240   Ubuntu 26.04 LTS
                                          172.17.0.1
                                          172.18.0.1
```

In this case Multipass has provisioned and Ubuntu 26 and I can access to it at `10.182.220.240`
(this IP will be required later)

## Installing our stack

We'll login into our new VM 

`multipass shell nomad`

To streamline the setup, we have prepared a public Git repository containing all the necessary scripts. Clone it inside your VM:

`git clone https://github.com/incsteps/multipass-nomad.git`

Now, install Docker using the provided script:

`./install-docker.sh`

Next, bring up the development stack using Docker Compose:

`sudo docker compose build`

`sudo docker compose up -d`

Initialize the MinIO configuration:

`sudo docker compose exec minio sh /usr/local/bin/init-minio.sh`

Note: The default username and password are set to minioadmin. You can modify these credentials in the docker-compose.yml file prior to starting the services.

The init-minio.sh script automatically creates a bucket named tusd. You can customize this bucket name to suit your project requirements.

Finally, initialize Nomad:

`sudo docker compose exec nomad sh /usr/local/bin/init-nomad.sh`

Once executed, the script will output a NOMAD_TOKEN. Save this value, as you will need it to authenticate your pipelines.

### Verifying the Web Interfaces

You can verify that both services are running correctly by accessing their web interfaces through your host browser. Replace x.y.z.w with the IP address assigned to your Multipass VM:

    MinIO Console: http://x.y.z.w:9000

    Nomad UI: http://x.y.z.w:4646

## Running a pipeline

With the stack up and running, you can now execute a pipeline from your host machine (where the Multipass VM acts as your private cloud environment).

The repository includes a basic Nextflow configuration to test the standard hello pipeline. Open a new terminal session on your laptop and run:

```shell
mkdir nomad-dev
cd nomad-dev
git clone https://github.com/incsteps/multipass-nomad.git
cd nextflow
 
export MINIO_ADDR=http://x.y.z.w:9000
export NOMAD_ADDR=http://x.y.z.w:4646
export NOMAD_TOKEN=9e5ad77c-xxxx-yyyy-zzzz-zzzzzzzzzz

nextflow run main.nf -w s3://tusd/wd
```

If the execution completes successfully, you have successfully run a Nextflow pipeline orchestrated entirely within your local "private cloud".

## Running rnaseq-nf

If your local hardware has sufficient resources, you can test more intensive pipelines, such as the official Nextflow RNA-Seq pipeline:

```shell
nextflow run nextflow-io/rnaseq-nf \
  -w s3://tusd/wd \
  -profile docker \
  -r 8253a586cc5a9679d37544ac54f72167cced324b \
  --outdir s3://tusd/rna-out
```

## Conclusion

In this post, we demonstrated how to build a local development cluster using Nomad, MinIO, and Multipass. 

This setup provides an excellent, resource-efficient sandbox to validate and test your Nextflow workflows locally before deploying them to production cloud infrastructures.

</PostDetail>