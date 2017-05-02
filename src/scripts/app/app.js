'use strict';


(function () {

    // Instance stores a reference to the Singleton
    let instance;
    const vkService = window.app.xhrService;

    function init() {
        const router = window.app.router;
        const navbar = new window.app.navbarComponent(router);

        let user =  JSON.parse(window.localStorage.getItem('currentUser'));
        vkService.getUsersProfiles({}, user.id)
            .then((res) => {
                let obj = Object.assign({}, user);
                obj.avatar = res[0].photo_50;
                window.localStorage.setItem('currentUser',  JSON.stringify(obj));
            });

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
$(document).ready(function () {
    $("#message-input").emojioneArea();
});
