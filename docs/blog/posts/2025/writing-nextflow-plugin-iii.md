---
date: 2025-09-28
title: Writing (and publishing) a Nextflow Plugin III
category: Plugins
tags: plugins, groovy
author: Jorge Aguilera
---

Welcome to this comprehensive four-part series on developing and publishing your own Nextflow plugins!
---

<PostDetail>

Nextflow plugins allow you to extend the core functionality of Nextflow, making your pipelines more powerful,
flexible, and integrated with external systems. Whether you're looking to add custom executors, integrate cloud services,
or enhance reporting, this series has you covered from initial concept to final release.

Use the links below to easily navigate the entire series:

- Part 1: Introduction and Creating a Nextflow Plugin link:writing-nextflow-plugin.adoc[]
- Part 2: Adding Configuration to Your Nextflow Plugin link:writing-nextflow-plugin-ii.adoc[]
- Part 3: Testing Nextflow Plugins with Spock (You Are Here)
- Part 4: Publishing Documentation and Generating a GitHub Release link:writing-nextflow-plugin-iv.adoc[]

Robust testing is key to reliability. Here, you'll learn how to leverage the powerful Spock Framework to write
effective unit and integration tests for your Nextflow plugin components.

WARNING:: This kind of tests can't be used in a complete pipeline. For example, you can't test a full Kubernetes
executor (or at least not easily) but using this approach you can validate how your plugin works in a more realistic
situation than simple unit tests

## nf-math

In this post we'll use the nf-math plugin we created in the first post.

We created a `test.nf` (and a `nextflow.config`) and we show our plugin in action executing nextflow in a terminal.

Now we'll create a `NfDslSpec` Spock test to integrate this kind of validations into our build process

INFO:: Spock is a test framework similar to JUnit. You can create tests with JUnit, but Nexflow provides some
utilities that make our tests straightforward to use


Create a `NfDslSpec.groovy` file at `src/main/test/incsteps/plugin` (where incsteps is the package name I choosed
for my plugin. Use your package instead)

Declare the class

```
class NfDslSpec extends Dsl2Spec{ //<1>

    @Shared String pluginsMode //<2>

```
<1> Instead from Specification we'll use a Dsl2Speec class from Nextflow
<2> We'll use to start and stop our plugin


Create a setup and cleanup. Spock will execute these methods every time it start/finish a test

```
    def setup() {
        PluginExtensionProvider.reset()
        pluginsMode = System.getProperty('pf4j.mode')
        System.setProperty('pf4j.mode', 'dev')
        def root = Path.of('.').toAbsolutePath().normalize()
        def manager = new TestPluginManager(root){
            @Override
            protected PluginDescriptorFinder createPluginDescriptorFinder() {
                return new TestPluginDescriptorFinder(){
                    @Override
                    protected Manifest readManifestFromDirectory(Path pluginPath) {
                        def manifestPath= getManifestPath(pluginPath)
                        final input = Files.newInputStream(manifestPath)
                        return new Manifest(input)
                    }
                    protected Path getManifestPath(Path pluginPath) {
                        return pluginPath.resolve('build/tmp/jar/MANIFEST.MF')
                    }
                }
            }
        }
        Plugins.init(root, 'dev', manager)
    }

    def cleanup() {
        Plugins.stop()
        PluginExtensionProvider.reset()
        pluginsMode ? System.setProperty('pf4j.mode',pluginsMode) : System.clearProperty('pf4j.mode')
    }
```

Basically we'll integrate our tests with the Pf4j library used by Nextflow instead to use the "installed" plugin

Now create as many tests as you think will be necessary to ensure quality to your plugin

For example, we'll validate the plugin calculate and return values for a list of doubles:

```
    def 'should calculate some values' () {
        when:
        def SCRIPT = """
            include { calculate_stats } from 'plugin/nf-math'

            Channel.of( [1.0, 2, 3.0, 21.2] )
                .map{ values ->
                    calculate_stats( values )
                }
                .view()
            """
        and:
        def result = new MockScriptRunner([
                math:[
                        max: -1
                ]
        ]).setScript(SCRIPT).execute()
        then:
        result.val ## [max:21.2, min:1.0, mean:6.8, median:2.5, stddev:9.634659654947166]
        result.val ## Channel.STOP
    }
```


`def 'should calculate some values' ()` is the starting point of our plugin. As you realize the name of the method
can be a sentence describing the intent of the test

SCRIPT is a simple String where we define the pipeline to be executed. As you can see we use the `include` directive,
Channel objet and operators as `map` or `view`

INFO:: View is a good operator to use as we'll validate the values returned by the pipeline

We use a `MockScriptRunner` provided by Nextflow to create a "light" version of the nextflow environment where run
the pipeline.  As you can see the first parameter is a Map you can use to provide configuration to the execution
similar to a `nextflow.config`

As our pipeline only returns a row (and them the pipeline ends) we can validate the values of the return

You can/must create more test and validate as many situations as you can, simply create more "def should" methods

</PostDetail>