---
date: 2025-09-29
title: Writing (and publishing) a Nextflow Plugin IV
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
- Part 3: Testing Nextflow Plugins with Spock link:writing-nextflow-plugin-iii.adoc[]
- Part 4: Publishing Documentation and Generating a GitHub Release (You Are Here)

This article guides you through generating clear documentation and standardizing your release process
using GitHub Actions and features, ensuring your work is easily discoverable and adoptable by the community.

WARNING:: It's important to note that the approach presented here—specifically the use of GitHub Actions for
documentation and releases—is my personal, non-official workflow.
Nextflow doesn't mandate a specific release tool, so feel free to adapt this process to your own preferred platform.

## Build and Test

We can use GitHub to check every change running our tests.

Create a folder in the root of the project `.github/workflows/` (**pay attention to the dot in github folder** )

Create a `build.yaml` file (name doesn't matter only the extension)

```
name: build
on:
  push:
    branches:
      - '*'
    tags-ignore:
      - '*'
  pull_request:
    branches:
      - '*'
jobs:
  build:
    name: Build
    if: "!contains(github.event.head_commit.message, '[ci skip]')"
    runs-on: ubuntu-latest
    timeout-minutes: 10
    strategy:
      fail-fast: false
      matrix:
        java_version: [17]

    steps:
      - name: Environment
        run: env | sort

      - name: Checkout
        uses: actions/checkout@v1
        with:
          fetch-depth: 1
          submodules: true

      - name: Setup Java ${{ matrix.java_version }}
        uses: actions/setup-java@v1
        with:
          java-version: ${{matrix.java_version}}
          architecture: x64

      - name: Compile
        run: ./gradlew assemble

      - name: Tests
        run: ./gradlew check
        env:
          GRADLE_OPTS: '-Dorg.gradle.daemon=false'
```

Once merged this file, GitHub will run a `./gradlew assemble check` in every commit, in all branches, all PR, etc

If some test fails, we'll receive a notification.


## Asciidoctor

I'm a big (big big) fan of Asciidoctor (https://asciidoctor.org/) and as it has a Gradle plugin one of the "extra"
features I like to include in my plugins documentation using it.

##= Gradle

Add the plugin into `plugins` closure of `build.gradle`

.build.gradle
```
plugins {
    id 'org.asciidoctor.jvm.convert' version '3.3.2'  //<1>
    id 'io.nextflow.nextflow-plugin' version '1.0.0-beta.9'
}
```
<1> Add the asciidoctor plugin


Create the asciidoctor configuration

.build.gradle
```
asciidoctor{ //<1>
    resources {
        from('src/docs/asciidoc/images') {
            include '**/*.png'
        }

        into './images'
    }
}
```
<1> Add to the end of build.gradle

##= Index.adoc

Create your first `index.adoc` page at `src/docs/asciidoc` folder

.index.adoc
```
= nf-csvext
Jorge Aguilera <jorge@incsteps.com>
:toc: left
:imagesdir: images

## Install

To install the plugin, add the plugin into your `nextflow.config`

blablabla
```

INFO:: Asciidoctor will convert all `.adoc` files to `.html` so you can create several pages and link all of them,
for example

##= Github Pages

If you use GitHub (in case you use others as Gitlab for example process is very similar) you need to prepare your
repository:

- go to settings
- select pages
- set "Build and deployment Source" as "Github Actions"

Them create a `ghpages.yml` file (ghpages can be whatever
but extension needs to be `yml` or `yaml`) in the `.github/workflows/` folder:

.ghpages.yml
```
name: ghpages
on:
  push:
    branches:
      - 'main' #<1>

  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    name: Build docu
    runs-on: ubuntu-latest
    timeout-minutes: 90
    steps:
      - name: Environment
        run: env | sort
      - uses: actions/checkout@v4
      - name: Set up JDK for x64
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
          architecture: x64
      - name: Generate
        run: ./gradlew asciidoctor
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3.0.1
        with:
          path: ./build/docs/asciidoc

  publish-ghpages:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
<1> adjust it in case you use other as `master` for example

Once committed and merged in the main branch, next merges will fire a GitHub action to build a static site and publish
it in the repository GitHub pages. For example, if my repo is `github.com/incsteps/nf-csvext` the url will be
https://incsteps.github.io/nf-csvext

## Tag and Release

Another feature GitHub Actions allows us is to automatically generate and publish a new release when we create a *tag*
in our repo

##= Secret

First, we need to add our NPR_API_KEY token to our repository as a *secret*:

- Goto settings
- Secrets and Variables
- Actions
- New repository secret

And create a new secret with your token. We'll use NPR_API_KEY but can be whatever

##= Github Action

Them, in your repo, create a `release.yaml` file in the `.github/workflows` folder (as with ghpages the name doesn't matter only
the extension)

.release.yml
```
name: release
on:
  push:
    tags:
      - '[0-9]+.[0-9]+.[0-9]+'
      - '[0-9]+.[0-9]+.[0-9]+-edge[0-9]+'

permissions:
  contents: write

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 90
    strategy:
      fail-fast: false
      matrix:
        java_version: [19]

    steps:
      - name: Environment
        run: env | sort

      - name: Checkout
        uses: actions/checkout@v1
        with:
          fetch-depth: 1
          submodules: true

      - name: Setup Java ${{ matrix.java_version }}
        uses: actions/setup-java@v1
        with:
          java-version: ${{matrix.java_version}}
          architecture: x64

      - name: Compile
        run: ./gradlew assemble

      - name: Tests
        run: ./gradlew check
        env:
          GRADLE_OPTS: '-Dorg.gradle.daemon=false'

  publish-gpr:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 19 for x64
        uses: actions/setup-java@v3
        with:
          java-version: '19'
          distribution: 'temurin'
          architecture: x64

      - name: build artifacts
        run: ./gradlew clean installPlugin -x test -P version=${GITHUB_REF#refs/tags/}

      - name: Upload artifact and release
        uses: softprops/action-gh-release@v2
        with:
          draft: false
          prerelease: false
          body_path: CHANGELOG.md
          files: |
            ./build/distributions/*

      - name: publish release
        env:
          NPR_API_KEY: ${{ secrets.NPR_API_KEY }}
        run: ./gradlew releasePlugin -x test -P version=${GITHUB_REF#refs/tags/}
```

Basically, we're telling to GitHub we want to run this pipeline when a new **tag** is created. This tag needs to follow
a semver pattern (0.0.1, 1.22.33), also we'll allow "release candidates" identified by `edge-XXX` suffix.

You can change this behavior and use your pattern if you want

##= Create a Release

When you're ready to publish a new release click in your GitHub repository page at "Releases"

- Draft a new release
- Create a tag (remember to use the semver notation)
- Give a title
- Generate a release notes
- Publish the release

Once you publish the release GitHub will create the tag and your pipeline will be executed.

The pipeline will build and test last version of your plugin and if all goes well it will send your to the registry
( `./gradlew releasePlugin -x test -P version=${GITHUB_REF#refs/tags/}` )

INFO:: Also, the action will attach the artifacts to the release as future references


And this is all. Once the plugin is approved, it will be ready to be used by the community!!!

</PostDetail>