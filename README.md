# J-MOTTO with Node.js

## Preparations

`cp config.json{.example,}` and fill out config.json

### if use Node.js and yarn

`yarn install`

### or, if use Docker

`docker build . -t jmotto`

## Usage

### if use Node.js and yarn

* Click shusha button: `yarn run -s shusha`
* Click taisha button: `yarn run -s taisha`
* Show timecard
  * current month: `yarn run -s timecard`
  * specified month: `yarn run -s timecard -- --yyyymm 201701`

### or, if use Docker

* Click shusha button: `docker run --rm -it jmotto shusha`
* Click taisha button: `docker run --rm -it jmotto taisha`
* Show timecard
  * current month: `docker run --rm -it jmotto timecard`
  * specified month: `docker run --rm -it jmotto timecard -- --yyyymm 201701`
