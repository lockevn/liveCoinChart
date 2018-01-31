var HitBTCService = {
    socket: new WebSocket('wss://api.hitbtc.com/api/2/ws'),
    isSocketOpen: false,

    isChannelAuthenticated: false,
    tickerCallback: null,

    open: function () {

        // Listen for messages
        HitBTCService.socket.addEventListener('message', function (wsEvent) {
            var objData = JSON.parse(wsEvent.data);
            if (objData.error) {
                console.error(objData);
            }

            // console.log(objData.channel, objData.method, objData.type);

            // inspect the message
            // dispatch to the appropriate callback, ticker message send to tickerCallback
            if (objData.channel == 'ticker' && objData.type == 'update') {
                // console.log('Message from server ', );
                if (HitBTCService.tickerCallback) {
                    HitBTCService.tickerCallback(objData.data);
                }
            }            
            
        });


        return new Promise(function (resolve, reject) {
            // Connection opened
            if (HitBTCService.isSocketOpen) {
                resolve(HitBTCService.socket);
            }
            HitBTCService.socket.addEventListener('open', function (event) {
                HitBTCService.isSocketOpen = true;
                resolve(HitBTCService.socket, event);
            });
        });
    },

    // http://hitbtc-com.github.io/hitbtc-api/#subscribe-to-ticker

    // send JSON text to the socket. If pass cmd as object, it will serialize to JSON text before sending
    sendCommand: async function (cmd) {
        await HitBTCService.open();    // ensure open webSocket before sendCommand

        var commandText = cmd;
        if (typeof (cmd) == 'object') {
            commandText = JSON.stringify(cmd);
        }

        console.debug(commandText);
        HitBTCService.socket.send(commandText);
    },


    // BUSINESS: just login, no need to sub to ticker, it still send ticker back
    // call tickerCallback for symbol 'ticker' 'update' event
    subscribeTicker: async function (symbol, tickerCallback) {
        // return null;    // TEST DEBUG, temporary disable

        var cmd = {
            "method": "subscribeTicker",
            "params": { "symbol": symbol },
            "id": "xcapsub_" + Date.now()
        };

        if (tickerCallback && typeof (tickerCallback) == 'function') {
            HitBTCService.tickerCallback = tickerCallback;
        }
        HitBTCService.sendCommand(cmd);
    },

    // call tickerCallback for symbol 'ticker' 'update' event
    getBalance: async function (symbol, balanceCallback) {
        await HitBTCService.login();   // if already logged in sucessfully before, we don't need to pass arguments

        console.log('getTradingBalance');
        var cmd = { "method": "getTradingBalance", "params": {} };

        if (balanceCallback) {
            HitBTCService.balanceCallback = balanceCallback;
        }
        HitBTCService.sendCommand(cmd);
    },

}


