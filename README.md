# liveCoinChart

Put this repo into a folder
Just open the index.html file in browser
Does not need to run webserver to play with this


# Technical

We use vuejs to write the app
This only use vanilla JS, no need to run any build script or transformation (webpack, babel, ...)

We have two charts in component.realtimechart
 - one uses epochjs (based on d3) to draw the window of price. This use jquery, I don't have time to remove this dependant.
 - one uses highcharts to draw a smaller window of price

We have one component.controlbox to select symbol (coin symbol)

Use underscore to throttle the handle of new ticker (when we have new update from websocket)

HitBTCService
wrap the business of connecting to HitBTC and get price (ticker)


