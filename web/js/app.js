'use strict';


var app = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {

        const router = new window.router();
        const navbar = new window.navbarComponent(router);

        return {
            router : router
        };
    }

    return {
        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };

})();