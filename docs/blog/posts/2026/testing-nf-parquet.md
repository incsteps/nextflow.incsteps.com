---
date: 2026-10-27
title: Validating Nextflow Parquet Pipelines 
category: Article
tags: parquet, nf-parquet, pipelines
author: Jorge Aguilera
---

Validating Parquet outputs in Nextflow pipelines

---

<PostDetail>

## Introduction

Working with structured data formats like Apache Parquet in Nextflow pipelines is common, 
but verifying that your processes generate valid output files can be tedious. Without proper testing utilities, 
you often end up writing ad-hoc scripts to inspect schemas, row counts, and data types after pipeline execution.

This post walks through how to test and validate Nextflow workflows that produce Parquet files using the nf-parquet 
plugin alongside nf-test. By leveraging native assertions for Parquet files in your tests, 
you can automatically verify structural integrity, schema definitions, and specific record contents without leaving your test suite.

## Pipeline

To demonstrate how Parquet generation works in Nextflow, this basic pipeline serializes a stream of records 
into a Parquet file using the nf-parquet plugin.

```groovy
include { toParquet } from 'plugin/nf-parquet'

workflow MAIN {
    main:
    channel.of(1..10_000)
            .map( {
                new myrecords.CustomRecord(it, "the $it record", it, it, it)
            })
            .toParquet("${workDir}/demo.parquet", [record: myrecords.CustomRecord])

    emit:
    ${workDir}/demo.parquet
}
```

In this setup, the workflow generates a channel of 10,000 elements, 
maps each to a custom record (myrecords.CustomRecord), and writes them directly to disk in Parquet format.

When you run this pipeline, if everything goes well, you should see a new Parquet file in your working directory with
10.000 records. If you are using nf-test for testing, you can use the `nft-parquet` plugin to validate the file.

## Test Automation

To ensure the pipeline produces a valid file with correct metadata and data types, I'll show you in this post how to use
the `nft-parquet` plugin to perform assertions.

### Basic Test

First assertion can be workflow success

```groovy
nextflow_workflow {

    name "Test Basic"
    script "workflows/hello.nf"
    workflow "MAIN"

    test("Should run without failures") {
        setup(){
            new File('workflows/demo.parquet')?.delete()
        }
        when {
            params {
            }
            workflow {
            }
        }

        then {
            assert workflow.success
            def outfile = workflow.out.get(0)[0]
            assert outfile.endsWith("demo.parquet")
        }
    }
}
```

### Testing Parquet Files

`nft-parquet` plugin allows you to assert the structure of a Parquet file so first thing you need to do is to 
import the plugin into you `nf-test.config`

```groovy
config {

    testsDir "tests"
    workDir ".nf-test"
    configFile "tests/nextflow.config"
    profile ""

    plugins {
        load "nft-parquet@0.0.2"
    }

    libDir "lib"
}
```

As you can see, we're loading also the `lib` folder where our custom classes are located.

## Assertions

### parquet 


Once you have the plugin loaded, you can use it to assert the structure of a Parquet file:

```groovy
then {
    ...
    def outfile = workflow.out.get(0)[0]
    ...
    assert path(outfile).parquet
}
```

`parquet` is a method provided by the plugin that allows you to validate the outputfile of the pipelien is a parquet file.

### rowCount

```groovy
then{
    with(path(outfile).parquet) {
        assert rowCount == 10_000
    }
}
```

### columnCount

```groovy
then{
    with(path(outfile).parquet) {
        assert columnCount == 5
    }
}
```

### columnNames

```groovy
then{
    with(path(outfile).parquet) {
        assert columnNames == ["id","name","sizell","value","percentile"]
    }
}
```

### rows

If the file is not so big, you can use the `rows` method to read the entire file and assert the contents

```groovy
then{
    with(path(outfile).parquet) {
        assert rows.size() == 10_000
        assert rows[0] == [1, 'the 1 record', 1, 1.0, 1.0]
        assert rows[10_000] == [10_000, 'the 10_000 record', 10_000, 10_000.0, 10_000.0]
    }
}
```

### rowIndex 

If you need to assert a specific row, you can use the `rowIndex` method to access it


```groovy
then{
    with(path(outfile).parquet) {
        assert rowIndex(500) == [500, 'the 500 record', 500, 500.0, 500.0]
    }
}
```

### schema

```groovy
then {
    path(outfile).parquet.schema == [
            "id"        : Long,
            "name"      : String,
            "percentile": Double,
            "sizell"    : Long,
            "value"     : Double,
    ]
}
```

## Conclusion

Validating Parquet outputs in Nextflow pipelines eliminates the need for ad-hoc post-processing scripts. 

By combining the nf-parquet plugin with nf-test, you can verify execution success, inspect structural metadata 
(rowCount, columnCount, columnNames), validate data types against an expected schema, and inspect individual records efficiently.

</PostDetail>