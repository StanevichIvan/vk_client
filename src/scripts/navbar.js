(function () {

    function NavbarComponent(router) {
        const navbarNode = document.getElementById("nav-bar");
        navbarNode.addEventListener('click', function (event) {
            event.preventDefault();
            if (event.target.className === 'menu__link') {
                router.renderComponent(event.target.textContent.replace(/[\W]+/g, ""));
            }
        });
    }

    app.navbarComponent = NavbarComponent;
})();