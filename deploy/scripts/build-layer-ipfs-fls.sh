#!/bin/bash

if [ "$1" == "--clean" ]; then
    rm -rf .build/layer/fls-ipfs/origin
    mkdir -p .build/layer/fls-ipfs/origin
fi

docker build --file docker/ipfs/Dockerfile --tag amazonlinux:nodejs_16 docker/ipfs
cp .layers/fls-ipfs/origin/index.mjs .build/layer/fls-ipfs/origin/index.mjs

if [ "$1" == "--clean" ]; then
    docker run --rm --volume ${PWD}/.build/layer/fls-ipfs/origin:/build amazonlinux:nodejs_16 /bin/bash -c "source ~/.bashrc; npm init -f -y; npm install ipfs-http-client --save && npm install --only=prod"
fi

cd .build/layer/fls-ipfs/origin && zip -FS -q -r ../../../../.layers/fls-ipfs-origin-layer.zip * && cd ../../../..
