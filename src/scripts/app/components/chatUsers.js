(function () {

    const vkService = window.app.xhrService;

    function ChartUsers(props) {

        this.activeRequest = {};
        this.wrap = document.getElementById('router-outlet');
        this.mount = props.mount;
        this.selectButton = createFriendsSelectButton();
        this.usersBox = createUsersBox();

        this.containerSelect = (e) => {

        };

        this.render = function () {
            this.selectButton.addEventListener('click', () => {
                console.log(1);
            });
            this.mount.appendChild(this.selectButton);
        };

        this.render();

        this.destroy = () => {
            this.mount.innerHTML = '';
        };
    }

    function createFriendsSelectButton() {
        let button = document.createElement('button');
        button.innerText = 'Select users';
        return button;
    }

    function createUsersBox() {

    }

    app.chatUsersComponent = ChartUsers;
})();