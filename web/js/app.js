'use strict';


(function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {
        const router = new window.app.router();
        const navbar = new window.app.navbarComponent(router);

        return {
            router: router
        };
    }

    app.getInstance = function () {

        if (!instance) {
            instance = init();
        }

        return instance;
    };
})();

$(document).ready(function() {
    $("#message-input").emojioneArea();
});
