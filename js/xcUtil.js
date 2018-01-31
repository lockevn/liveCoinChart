'use strict';

/************** This calculating business should stay in the separated class, so we can use in both nodejs and js */
/*
Usage: var xcUtilModule = require('./lib/xcUtil');
var xcUtil = new xcUtilModule({});  // call the constructor

*/
(function () {
    // this is declare the business class
    var xcUtil = (function () {
        // constructor
        var xcUtil = function (options) {
        };

        function getOrSetLocalStorage(key, defaultValue) {
            var valFromLS = localStorage.getItem(key);
            if (!valFromLS) {
                // store the default value to LS, return it
                localStorage.setItem(key, defaultValue);
                valFromLS = defaultValue;
            }

            return valFromLS;
        }

        xcUtil.prototype.getOrSetLocalStorage = getOrSetLocalStorage;

        return xcUtil;
    })();

    // in order to make this lib live in both node and browser,
    // we export to NodeJs if we have the module
    // otherwise, we assign to the global window object of Browser
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        /**
         * Node Module exports.
         * @public
         */
        module.exports = xcUtil;
    }
    else {
        window.xcUtil = xcUtil;
    }
})();
/************** ===================================== */
