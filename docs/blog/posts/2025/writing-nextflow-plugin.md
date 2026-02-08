---
date: 2025-09-26
title: Writing (and publishing) a Nextflow Plugin
category: Plugins
tags: plugins, groovy
author: Jorge Aguilera
---

Welcome to this comprehensive four-part series on developing and publishing your own Nextflow plugins!
---

<PostDetail>

Welcome to this comprehensive four-part series on developing and publishing your own Nextflow plugins!

Nextflow plugins allow you to extend the core functionality of Nextflow, making your pipelines more powerful,
flexible, and integrated with external systems. Whether you're looking to add custom executors, integrate cloud services,
or enhance reporting, this series has you covered from initial concept to final release.

Use the links below to easily navigate the entire series:

- Part 1: Introduction and Creating a Nextflow Plugin (You Are Here)
- Part 2: Adding Configuration to Your Nextflow Plugin link
- Part 3: Testing Nextflow Plugins with Spock 
- Part 4: Publishing Documentation and Generating a GitHub Release


## Intro

Some useful links as introduction reference:

- https://www.nextflow.io/docs/latest/plugins/plugins.html
- https://www.nextflow.io/docs/latest/plugins/developing-plugins.html
- https://www.nextflow.io/docs/latest/plugins/plugin-registry.html


## Language

Nextflow is mainly written in Apache Groovy (4.x) language. Groovy is one of the "JVM language" similar to Java,
Kotlin or Scala

I'll use Groovy as the main language, but if you feel more comfortable with Java steps and syntax are very similar,
so it's not complicated to code the plugin in Java and it'll work

## Nextflow plugin features

A plugin can provide different features to the Nextflow ecosystem:

- Function(s). Instead of populating and repeating the same code across all your pipelines, you can create a plugin
with several functions. For example, a "validate_params" function can validate if the provided params are ok following
your own logic

- Operator(s). Similar to a function but oriented to work with a DataFlow. It receives a DataflowReadChannel and
provides a DataflowWriteChannel. The operator will be notified when an input is ready in the read channel and it
can emit an output when considered necessary

- Factory(s). Similar to operators but oriented to produce data. It returns a DataflowWriteChannel where emit
values. Can be configured with params if you desired

- Observer(s). A plugin can be notified about the progress execution of the pipeline using Observers so you can
create your own report, abort the process, etc

- Executor. Maybe the most complicated feature (at least to me). You can create a new Executor and it will work
with Core executing new Tasks when Core required. You need to maintain/provide also the status of every one

- Command. Your plugin can provide command to be executed "outside" the execution of a pipeline. For example
it can provide a "send-reports-to-our-backend" command to zip all the reports and upload it to your backend server


## Our plugin

For the sake of simplicity, in this post we'll create a simple plugin with some functions and operators.

Our plugin will be a Math utility with following features:

- some math functions to work with a List (as max, min, average, ...)
- a operator to calculate some stats of items in a channel. Similar to the functions but reading from a channel

For sure, for this example, we can implement all the logic in our plugin but as an example of how to use open source
 libraries, I'll use Apache Math for math operations.

## Requirements

- Java 17 (you can use sdkman to install and manage different versions easily)
- IntelliJ Community Edition as IDE (I dont like VSCode, sorry)
- Nextflow installed

## Create the plugin

In you dev folder execute:

`nextflow plugin create`

- plugin name: nf-math
- organization: Incremental Steps (use yours)
- project path: nf-math

Open the nf-math folder with IntelliJ and compile the project using the `build` gradle task (you can find it in
the "Gradle" toolbar, at the left)

If all goes well, now we'll try to "install" it in our local, so execute the `installPlugin` gradle task under
`nextflow plugin` section

Create a subfolder `validation` (or whatever) and create our first pipeline

.nextflow.config

```
plugins {
    id "nf-math@0.1.0" //<1>
}
```

you can find current version value at `build.gradle`

.test.nf

```
include { sayHello } from 'plugin/nf-math'

sayHello("hi")
```

Now, you can run your pipeline:

`nextflow run test.nf`

```
Launching `test.nf` [disturbed_bose] DSL2 - revision: 93fbf85726

Pipeline is starting! 🚀
Hello, hi!
Pipeline complete! 👋
```

Congratulations!!! Your first plugin is alive

## Removing not desired features

We'll remove some features created by Nextflow

Delete following files:

- src/main/groovy/incrementalsteps/plugin/NfMathFactory
- src/main/groovy/incrementalsteps/plugin/NfMathObserver
- src/test/groovy/incrementalsteps/plugin/NfMathObserverTest

In `build.gradle` change

```
extensionPoints = [
        'incrementalsteps.plugin.NfMathExtension',
        'incrementalsteps.plugin.NfMathFactory'
    ]
```

by

```
extensionPoints = [
        'incrementalsteps.plugin.NfMathExtension',
    ]
```


INFO:: As our plugin will provide only function and operators, we remove Factory and Observer.

Rerun the `installPlugin` task and execute again the `test.nf` plugin. This time you will see only

```
Launching `test.nf` [disturbed_bose] DSL2 - revision: 93fbf85726

Hello, hi!
```

Great, we have a starting point for our plugin

## Add commons-math dependency

As our plugin will use Apache Math, we'll include it as a dependency in our `build.gradle`:

.build.gradle
```
dependencies{
    implementation 'org.apache.commons:commons-math3:3.6.1' //<1>
}
```

You can put it at the end of the file, but I like to put after plugins block, at the beginning

## Our first Function

Open `NfMathExtension.groovy` and remove the function sayHello (don't forget to remove also the annotation @Function)

Create our first function

```
@Function
 Map calculate_stats( List<Double> values) {
     def descriptiveStatistics = new DescriptiveStatistics() //<1>
     for(double d : values){
         descriptiveStatistics.addValue(d)
     }

     [
             max: descriptiveStatistics.max,
             min: descriptiveStatistics.min,
             mean : descriptiveStatistics.mean,
             median: descriptiveStatistics.getPercentile(50),
             stddev: descriptiveStatistics.standardDeviation
     ]

 }
```

Include import if intellij doesn't include it automatically

Basically our function will receive a list of numbers and will return a map with some stats

Ejecute the `installPlugin` again

Reuse our `test.nf` or create a new one:

.test.nf
```
include { calculate_stats } from 'plugin/nf-math'

println calculate_stats( [1.0, 2, 3.0, 21.2] )
```

and execute it:

`nextflow run test.nf`

```
Launching `test.nf` [crazy_saha] DSL2 - revision: 9e046654f5

[max:21.2, min:1.0, mean:6.8, median:2.5, stddev:9.634659654947166]
```

## Test

As you realize, We've been testing our tests in a "dirty" way so now we'll create a test

.src/test/groovy/incrementalsteps/plugin/NfFunctionSpec.groovy
```
class NfFunctionSpec extends Specification {

    def 'should calculate values for a list' () {
        given:
        def list = [0, 1.2, 3, 23.1, 18]
        def functions = new NfMathExtension()

        when:
        def ret = functions.calculate_stats(list)

        then:
        ret ## [1]
    }
}
```

This time we'll execute the `build` gradle to be sure our plugin is validated

As you can gess, it will fail because result is not [1]

```
Condition not satisfied:

ret ## [1]
|   |
|   false
[max:23.1, min:0.0, mean:9.06, median:3.0, stddev:10.696167537954892]
```

Fix our test changing the condition expression

```
then:
ret == [max:23.1, min:0.0, mean:9.06, median:3.0, stddev:10.696167537954892]
```

## Publish

Now our plugin is working fine it's time to let the community use it!!!

If you use Github, you can create a repository and commit your changes on it. Then you create your first Release
using the Github UI and attach the plugin binary

To generate the binary you need to execute the `packagePlugin` and upload the zip located in `build/distributions`
folder

Users can execute your plugin using the NXF_PLUGINS_TEST_REPOSITORY env as explaining in
https://www.nextflow.io/docs/latest/plugins/developing-plugins.html

But if you're confidence with your plugin and want everyone uses it you can publish in the official repository:

- Create an account at https://registry.nextflow.io/
- Create an access token at https://registry.nextflow.io/access-tokens (grab it in a secure place and never include
it in any repository)
- Register/Claim the plugin https://registry.nextflow.io/claim-plugin (Pay attention the Provider **must** to be
same you use when created the plugin and it's specified in your `build.gradle` ). Approval is requiered, but it
doesn't take so much, at least in my recent claims.

Open a terminal console and navigate to your plugin folder:

```
export NPR_API_KEY=your_token_value
./gradlew clean build installPlugin
```

If all goes well, your last version plugin will be uploaded to the registry and someone at Sequera will review it
and hopefully approve it !!!!!!!!!!!

Now be ready to receive feedback and issues!


## Next Step

In the next post we'll see how to implement an Operator to consume the double values from a Channel instead as parameters


</PostDetail>
