#!/bin/bash

websiteDir="../suomikino"

function build {
    echo "Build start"
    rm -rf dist
    ng build --prod --base-href "https://perttvil.github.io/suomikino/"
    echo "Build end"
}

function copy {
    echo "Copy start"
    cp -rvf dist/* $websiteDir/
    echo "Copy end"
}

function push {
    echo "Push start"
    pushd $websiteDir
    git stash
    git checkout gh-pages
    git add .
    git commit -am "Next version"
    git push origin gh-pages
    git stash pop
    popd
    echo "Push end"
}

build && copy && push