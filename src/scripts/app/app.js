'use strict';


(function () {

    // Instance stores a reference to the Singleton
    let instance;

    function init() {
        const router = window.app.router;
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

// emoji area
$(document).ready(function() {
    $("#message-input").emojioneArea();
});
