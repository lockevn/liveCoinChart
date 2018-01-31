/**********************************/
/*
this page declare component that act as a block inside other component
It can be nested or use in several place
*/
/**********************************/




// get realtime price from websocket, and emit that info
// this is a functional component only, drop it in the page and it starts notifying the price
// $emit: lasttick { p: +result.last, v: +result.volume, time };
var realtimeUpdaterComponent = Vue.component('realtime-updater', {
    props: ['symbol'],
    template: `<div></div>`,
    data: function () {
        return {
            lastTick: {
                p: +(xcUtil.getOrSetLocalStorage(this.symbol, 0)),
                v: 0,
                time: (Date.now() / 1000) | 0
            },
        }
    },    

    mounted: function () {
        var vm = this;
        this.$nextTick(function () {
            var indexDelaySaveStorage = 0;
            // TODO: improve this, we assume that VietnamStock has < 3 characters symbol
            if (vm.symbol.length > 3) {

                HitBTCService.open().then(function () {
                    HitBTCService.subscribeTicker(vm.symbol,
                        _.throttle(function f(result) {
                            if (result.symbol !== vm.symbol) {
                                return;
                            }

                            var time = (Date.now() / 1000) | 0;
                            vm.lastTick = { p: +result.last, v: +result.volume, time };
                            vm.$emit('lasttick', vm.lastTick);

                            indexDelaySaveStorage++; // increase loop count
                            if (indexDelaySaveStorage > 20) {
                                indexDelaySaveStorage = 0;
                                // loop 10 times, we save to localStorage
                                localStorage.setItem(vm.symbol, result.last);
                                // console.debug(`save to localStorage ${vm.symbol} ${result.last}`);
                            }
                        }, 1000)
                    );
                }); // end then

            }
            else {
                // VietnamStock, we don't have realtime data now
            }
        });

    }   // mounted
});





// get realtime price from websocket, Display chart
var realtimeChartComponent = Vue.component('realtime-chart', {
    props: ['symbol', 'lastTick'],
    template: `
<div :id="'realtimeChartComponent_' + _uid">
    <h3>Realtimechart {{symbol}} {{lastTick}}, {{windowSize}} datapoints</h3>
    <slot></slot>
    <!-- saved from url=https://epochjs.github.io/epoch/real-time/ -->
    <div id="real-time-line" class="epoch" style="height: 40vh; "></div>
</div>
`,
    data: function () {
        return {
            // chartObject: null,  
            // This comment line: DOESN'T hold reference to the epoch object inside this component. 
            // This will make vm.chartObject returns normal object. Using it as reactive Object will raise error for the epoch chart
            windowSize: 120,            
        }
    },        
    mounted: function () {
        var vm = this;
        this.$nextTick(function () {

            // INIT THE EPOCH CHART
            var elChart = document.querySelector(`#realtimeChartComponent_${vm._uid} .epoch`);  // get the chart inside this component
            var chartObject = $(elChart).epoch({
                type: 'time.line',
                // data: data.history(),
                //ticks: { time: 10, right: 10, left: 10 },
                //fps: 50,
                windowSize: vm.windowsize,
                queueSize: vm.windowsize * 2,
                historySize: vm.windowsize * 4,
                data: [{
                    values: [{
                        time: vm.lastTick.time || Date.now() / 1000,
                        y: vm.lastTick.p
                    }]
                }],
                axes: ['left', 'bottom', 'right']
            });
            vm.chartObject = chartObject;

            vm.$watch('lastTick', function (lastTick) {
                var vm = this;

                var newVal = [{ time: lastTick.time, y: +(lastTick.p) }];
                chartObject.push(newVal);
            });

        })  // nextTick

    }   // mounted

});





// get realtime price from websocket, Display chart
// $emit: lasttick { p: +result.last, v: +result.volume, time };
var realtimeHighChartComponent = Vue.component('realtime-highchart', {
    props: ['symbol', 'lastTick'],
    template: `
<div :id="'realtimeHighChartComponent_' + _uid">    
    <slot></slot>
    <div class="highchartrealtime" style="height: 40vh; margin: 0 auto"></div>
</div>
`,
    data: function () {
        return {
            // chartObject: null,  
            // This comment line: DOESN'T hold reference to the epoch object inside this component. 
            // This will make vm.chartObject returns normal object. Using it as reactive Object will raise error for the epoch chart                 
        }
    },    
    
    mounted: function () {
        var vm = this;
        this.$nextTick(async function () {
            // use https://www.highcharts.com/demo/dynamic-update/dark-unica            
            function initHighChartRealtime(domElement) {
                return new Promise(function (resolve, reject) {

                    Highcharts.setOptions({
                        global: {
                            useUTC: false
                        }
                    });

                    var realtimeChartObject = Highcharts.chart(domElement, {
                        chart: {
                            type: 'area',
                            animation: Highcharts.svg, // don't animate in old IE
                            marginRight: 10,
                            events: {
                                load: function () {
                                    resolve(this);  // RESOLVED when loading completed 
                                }
                            }
                        },
                        title: { text: `Live data ${vm.symbol}` },
                        xAxis: {
                            type: 'datetime',
                            tickPixelInterval: 150
                        },
                        yAxis: {
                            title: { text: 'Price' },
                        },
                        tooltip: {
                            formatter: function () {
                                return '<b>' + this.series.name + '</b><br/>' +
                                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
                                    Highcharts.numberFormat(this.y, 2);
                            }
                        },
                        legend: { enabled: false },
                        credits: { enabled: false },
                        series: [{
                            name: 'price',
                            data: (function () {
                                var data = [],
                                    time = (new Date()).getTime(),
                                    i;

                                for (i = -19; i <= 0; i += 1) {
                                    data.push({
                                        x: time + i * 1000,
                                        y: 1
                                    });
                                }
                                return data;
                            }())
                        }]
                    });

                })
            }

            var elHighChartRealtime = document.querySelector(`#realtimeHighChartComponent_${vm._uid} .highchartrealtime`);  // get the chart inside this component
            vm.chartObject = await initHighChartRealtime(elHighChartRealtime);

            vm.$watch('lastTick', function (lastTick) {
                var vm = this;

                var newVal = [{ time: lastTick.time, y: +(lastTick.p) }];
                var series = vm.chartObject.series[0];
                series.addPoint([lastTick.time * 1000, +(lastTick.p)], true, true);
            });

        })  // nextTick

    }   // mounted

});

