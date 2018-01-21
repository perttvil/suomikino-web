#!/bin/bash

websiteDir="../suomikino"

function build {
    echo "Build start"
    rm -rf dist/*
    ng build --prod --base-href "https://perttvil.github.io/suomikino/"
    echo "Build end"
}

function clean {
    echo "Clean start"
    pushd $websiteDir
    rm *
    popd
    echo "Clean end"
}

function copy {
    cp -rf dist/* $websiteDir/
}

function push {
    echo "Push start"
    pushd $websiteDir
    git checkout gh-pages
    git add .
    git commit -am "Next version"
    git push origin gh-pages
    popd
    echo "Push end"
}

build && clean && copy && push