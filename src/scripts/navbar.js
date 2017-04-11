var navbarComponent = (function () {

    function NavbarComponent(router) {
        const navbarNode = document.getElementById("nav-bar");
        navbarNode.addEventListener('click', function (event) {
            event.preventDefault();
            if (event.target.className === 'menu__link') {
                router.renderComponent(event.target.textContent.replace(/[^a-zA-Z]+/g, ""));
            }
        });

        document.addEventListener('DOMContentLoaded', function () {
            let icon = document.querySelector('.main-logo');
            let menu = document.querySelector('.content__menu');
            let menuActive = false;
            icon.addEventListener('click', function () {
                if (!menuActive) {
                    menu.className += " active";
                    menuActive = true;
                } else {
                    menu.className = menu.className.replace("active", '');
                    menuActive = false;
                }
            });
        });
    }

    return NavbarComponent;
})();