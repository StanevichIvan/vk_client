(function(){

    const app = window.app.getInstance();

    document.addEventListener('DOMContentLoaded', function () {
        let icon = document.querySelector('.main-logo');
        let menu = document.querySelector('.content__menu');
        icon.addEventListener('click', function () {
            menu.classList.toggle('active');
            // if (!menuActive) {
            //     menu.className += " active";
            //     menuActive = true;
            // } else {
            //     menu.className = menu.className.replace("active", '');
            //     menuActive = false;
            // }
        });
    });
})();
