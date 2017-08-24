# J-MOTTO with Node.js

## Preparations

`cp config.json{.example,}` and fill out config.json

### if use Node.js and yarn

`yarn install`

### or, if use Docker

`docker build . -t jmotto-node`

## Usage

### if use Node.js and yarn

* Click shusha button: `yarn run -s shusha`
* Click taisha button: `yarn run -s taisha`

### or, if use Docker

* Click shusha button: `docker run --rm -it jmotto-node shusha`
* Click taisha button: `docker run --rm -it jmotto-node taisha`
