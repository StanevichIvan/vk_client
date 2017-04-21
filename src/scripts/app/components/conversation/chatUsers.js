(function () {

    const vkService = window.app.xhrService;

    function ChartUsers(props) {

        this.activeRequest = {};
        this.wrap = document.getElementById('router-outlet');
        this.mount = props.mount;
        this.userSelect = props.select;
        this.selectButton = createFriendsSelectButton();
        this.usersContainer = document.createElement('div');
        this.usersContainer.classList.add('chart-select');
        this.mount.appendChild(this.usersContainer);
        this.form = document.createElement('form');
        this.form.id = 'select-friends';
        this.users = [];
        this.filter = '';
        this.userIds = [];

        this.render();

        this.destroy = () => {
            this.mount.innerHTML = '';
        };
    }

    ChartUsers.prototype.render = function () {
        this.selectButton.addEventListener('click', () => {
            if(this.users.length === 0)
                this.createUsersBox(this.usersContainer);
        });
        this.mount.appendChild(this.selectButton);
        this.createSearchInput();
        this.createStartButton();
    };

    ChartUsers.prototype.showUsers = function () {

        this.users.forEach((item) => {
            let div = document.createElement('div');

            let checked = '';
            if (this.userIds.includes(item.id))
                checked = 'checked';

            div.innerHTML = `<input ${checked} type='checkbox' id='${item.id}' value='${item.id}'>
                                        <label for="${item.id}">${item.firstName} ${item.lastName}</label>`;

            div.querySelector(`input`).addEventListener('click', (e) => {
                if (e.target.checked) {
                    this.userIds.push(item.id);
                } else {
                    this.userIds.splice(this.userIds.indexOf(item.id) , 1);
                }
            });

            if (this.filter.length !== 0 && !(item.firstName + item.lastName).includes(this.filter))
                div.style.display = 'none';

            this.form.appendChild(div);
        });
        this.mount.appendChild(this.form);
    };


    ChartUsers.prototype.createStartButton = function () {
        button = document.createElement('button');
        button.innerHTML = 'start chat';
        button.type = 'button';
        button.classList.add('chart-select__start-chat');

        button.addEventListener('click', () => {
            this.userSelect(this.userIds);
            this.mount.innerHTML = '';
        });

        this.mount.appendChild(button);
    };

    ChartUsers.prototype.createUsersBox = function (mountNode) {
        vkService.getFriends(this.activeRequest)
            .then((res) => {
                this.users = res;
                this.showUsers();
            });
    };

    ChartUsers.prototype.createSearchInput = function () {
        let searchInput = document.createElement('input');
        searchInput.id = 'chat-friends-select';

        searchInput.addEventListener('keyup', (e) => {
            if (e.target.value !== 0) {
                this.filter = e.target.value;
                this.form.innerHTML = '';
                this.showUsers();
            }
        });
        searchInput.classList.add('chart-select__input');
        this.mount.appendChild(searchInput);
    };

    function createFriendsSelectButton() {
        let button = document.createElement('button');
        button.innerText = 'Select users';
        return button;
    }

    app.chatUsersComponent = ChartUsers;
})();