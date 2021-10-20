# funk.js

> 🔌 NodeJS Library for interacting with Funk - Statio's Realtime Service

## About this library

This Library is used for interacting with Funk - the realtime backend that powers Statio. Please note that this backend is not currently not intended to be used within products outside of Statio and no support is offered for outside use.

## Usage

### Creating a client

```js
import { Funk } from "funk.js";

const funk = new Funk();
```

### Subscribing to events

```js
funk.on("fullData", (data) => {
    console.log("Full data received for " + data.length + " stations");
});

funk.on("stationChanged", (station) => {
    console.log("Station change received for #" + station.id + " (" + station.listening + " listeners)");
});
```
