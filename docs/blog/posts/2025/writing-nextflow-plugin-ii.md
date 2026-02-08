---
date: 2025-09-26
title: Writing (and publishing) a Nextflow Plugin II
category: Plugins
tags: plugins, groovy
author: Jorge Aguilera
---

Welcome to this comprehensive four-part series on developing and publishing your own Nextflow plugins!

---

Nextflow plugins allow you to extend the core functionality of Nextflow, making your pipelines more powerful,
flexible, and integrated with external systems. Whether you're looking to add custom executors, integrate cloud services,
or enhance reporting, this series has you covered from initial concept to final release.

Use the links below to easily navigate the entire series:

- Part 1: Introduction and Creating a Nextflow Plugin link:writing-nextflow-plugin-iv.adoc[]
- Part 2: Adding Configuration to Your Nextflow Plugin (You Are Here)
- Part 3: Testing Nextflow Plugins with Spock link:writing-nextflow-plugin-iii.adoc[]
- Part 4: Publishing Documentation and Generating a GitHub Release link:writing-nextflow-plugin-iv.adoc[]


Moving beyond the basic setup, this post dives into how to define, manage, and access custom configuration within your plugin, making it truly adaptable for various user environments.

To have a more interesting plugin, we'll create a new `nf-llm` plugin following the steps explained in the previous post.

This new plugin will allow the user to store messages in an Embedded store and "chat" with an LLM at the end of the
pipeline about the messages collected during the execution

For example, a simple pipeline can be

```
include { addMessage; chat } from 'plugin/nf-llm'

channel.of( 'hi',
            'this is a simple sentence generated at '+new Date(),
            'dont be shine and give me a hi'
        )
        .subscribe(
                onNext: { v ->
                    addMessage v
                },
                onComplete: {
                    println chat("Generate a brief of the conversation")
                })
```

Imagine instead a simple channel of strings you can call `addMessage` in every process executed and once completed
the pipeline you can request to the LLM to generate a report, analyze times, ...

For the sake of simplicity, our plugin will use Google Gemini (but can be easily replaced with OpenAI, Ollama, etc),
so the user needs to provide his `apiKey` in the `nextflow.config` . Also, the user will be allowed to specify
which model to use in their pipeline:

```
plugins {
    id "nf-llm@0.1.0"
}

llm{
    model = "gemini-2.5-flash"
    apiKey = "AIzaSy------"
}
```

## Creating our new plugin

Following the previous post, we have a new plugin created, so now is the time to add our logic:

- add dependencies

```
    implementation "dev.langchain4j:langchain4j:1.4.0"
    implementation "dev.langchain4j:langchain4j-embeddings-all-minilm-l6-v2:1.4.0-beta10"
    implementation "dev.langchain4j:langchain4j-google-ai-gemini:1.4.0"
```

- create an Assistant interface

.src/main/groovy/incsteps.plugin/Assistant.groovy
```
package incsteps.plugin

interface Assistant {

    String chat(String prompt)

}
```

- create an LlmFactory

.src/main/groovy/incsteps.plugin/LlmFactory.groovy
```
import dev.langchain4j.data.segment.TextSegment
import dev.langchain4j.memory.chat.MessageWindowChatMemory
import dev.langchain4j.model.chat.ChatModel
import dev.langchain4j.model.embedding.EmbeddingModel
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever
import dev.langchain4j.service.AiServices
import dev.langchain4j.store.embedding.EmbeddingStore
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore

class LlmFactory {

    static EmbeddingModel embeddingModel(){
        new AllMiniLmL6V2EmbeddingModel()
    }

    static EmbeddingStore<TextSegment> embeddingStore() {
        new InMemoryEmbeddingStore()
    }

    static ChatModel chatModel(String model, String apiKey){
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(model)
                .temperature(0.8)
                .build();
    }

    static Assistant assistant(ChatModel model, EmbeddingStore embeddingStore){
        return AiServices.builder(Assistant.class)
                .chatModel(model)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(Integer.MAX_VALUE))
                .contentRetriever (EmbeddingStoreContentRetriever
                        .builder()
                        .maxResults(30)
                        .embeddingStore(embeddingStore)
                        .build())
                .build();
    }
}
```

INFO:: Basically, we are creating our "business logic" following Langchain4j tutorials creating a series of
artifacts required to build an `Assistant` how use an InMemory storage as knowledge repository

By the moment, nothing special relates to our Nextflow Plugin

## Configuration

We'll create a new class to represent our configuration requirements (remember, a model and an apiKey)

.src/main/groovy/incsteps.plugin/PluginConfig.groovy
```
class PluginConfig {

    final String model
    final String apiKey

    private PluginConfig(String model, String apiKey){
        this.model = model
        this.apiKey = apiKey
    }


    static PluginConfig fromMap(Map config){
        assert config.containsKey("apiKey")

        String model = config.model ? config.model.toString() : "gemini-2.5-flash"
        String apiKey = config.apiKey.toString()

        new PluginConfig(model, apiKey)
    }

}
```

As you can see, this is a simple Java Bean. You can model as you want, but basically the idea is to retrieve values
from a Map. In my example, the only way to create a PluginConfig is using the `static fromMap` method

This Map can be retrieved from the `Session` in our `NfLlmExtension` (created by nextflow)

.src/main/groovy/incsteps.plugin/NfLlmExtension.groovy
```
class NfLlmExtension extends PluginExtensionPoint {

    private PluginConfig llmConfig

    @Override
    protected void init(Session session) {
        llmConfig = session.config.containsKey("llm") ? session.config.llm as Map : [:]
        ....
    }
```

Once all plugins are loaded, Nextflow will initialize all Extensions calling their `init` method. This is the moment
to check and validate our configuration

## Initializing our Function

WARNING:: Our function requires to be initialized, maybe yours no, so you can skip this part

As our function wants to store intermediate messages in the storage we need to initialize:

```
    protected void init(Session session) {
        def llmConfig = session.config.containsKey("llm") ? session.config.llm as Map : [:]
        initAssistant( PluginConfig.fromMap( llmConfig ) )
    }

    private Assistant assistant
    private EmbeddingModel embeddingModel
    private EmbeddingStore embeddingStore

    void initAssistant(PluginConfig config){
        embeddingModel = LlmFactory.embeddingModel()
        embeddingStore = LlmFactory.embeddingStore()

        def chatModel = LlmFactory.chatModel(config.model, config.apiKey)
        assistant = LlmFactory.assistant(chatModel, embeddingStore)
    }
```

## Exposing functions

Now our plugin is fully configured and initialized we can expose our functions to the pipeline, as we did with
the nf-math plugin:

```
    @Function
    void addMessage(String target) {
        def segment = TextSegment.from(target)
        def embedding = embeddingModel.embed(segment)
        embeddingStore.add( embedding.content(), segment )
    }

    @Function
    String chat(String msg) {
        assistant.chat(msg)
    }
```

## Validating

Once compiled and "installed" (remember `installPlugin` Gradle task?) We can run our `test.nf`

To validate config is applied, we'll try some "invalid" values. For examples remove apiKey from configuration

```
plugins {
    id "nf-llm@0.1.0"
}

llm{
    model = "gemini-2.5-flash"
    // remove or set to null: apiKey = null
}
```

Will fail as `apiKey` is required by PluginConfig

You can change also, `model` with "gemini-2.5" and compare the result with the flash model, etc

INFO:: Remember, this is the "dirty"/"quick" way. You can/need to create tests and validate all uses cases


## Executing

Once configured the plugin, I can run the pipeline and "chat" with my LLM:

```
nextflow run test.nf

 N E X T F L O W   ~  version 25.04.7

Launching `test.nf` [extravagant_linnaeus] DSL2 - revision: 7e8c5f63b0


The conversation begins with a "hi" and describes itself as a simple sentence generated on Sun Sep 28 11:11:09 CEST 2025. It concludes by requesting a "hi" back, advising the recipient not to be shy.
```
