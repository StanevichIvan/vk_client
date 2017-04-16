(function () {


    const app = window.app.getInstance();
    window.app.menuObserver.subscribe(toggleMenu);

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelector('.main-logo').addEventListener('click', window.app.menuObserver.fire('menu click'));
    });

    function toggleMenu() {
        let icon = document.querySelector('.main-logo');
        let menu = document.querySelector('.content__menu');
        icon.addEventListener('click', function () {
            menu.classList.toggle('active');
        });
    }
})();

$(document).ready(function() {
    $("#message-input").emojioneArea();
});
