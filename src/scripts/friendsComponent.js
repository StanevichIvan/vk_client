(function () {

    const vkService = window.app.xhrService;

    function FriendsComponent() {
        this.activeRequest = {};

        this.wrap = document.getElementById('router-outlet');
        this.dialogsContainer = createDialogsColumn();
        this.chatContainer = createChatContainer();
        this.wrap.appendChild(this.dialogsContainer);
        this.wrap.appendChild(this.chatContainer);

        this.container = document.getElementById('messages-container');
        this.searchContainer = document.getElementById('friends-search-container');
        this.component = document.createElement('div');
        this.activeRequest = {};

        this.containerSelect = (e) => {
            if (e.target.classList.contains('conversation__message')) {
                let id = e.target.dataset.id;
                if (id) {
                    vkService.getPhotos(this.activeRequest, id);
                }

                window.app.router.renderComponent('albums', id);
            }
        };

        this.render();

        this.container.addEventListener('click', this.containerSelect);

        this.destroy = () => {
            if (this.activeRequest.cancel)
                this.activeRequest.cancel();

            this.container.removeEventListener('click', this.containerSelect);
            this.container.innerHTML = '';
            this.searchContainer.innerHTML = '';
            this.wrap.innerHTML = '';
        };
    }

    FriendsComponent.prototype.render = function () {
        this.activeRequest = vkService.getFriends(this.activeRequest).then((res) => {
            showFriends(res, this.component);
            this.renderSearchBar();
        });
    };

    FriendsComponent.prototype.renderSearchBar = function () {
        let searchBar = document.createElement("div");
        searchBar.innerHTML = `
                <div class="conversation__search">
                <form id="friend-search-form" class="conversation__search-form"><input class="conversation__input"  type="text" id="friend-search" 
                placeholder="Find a friend" name="friend">
                </form>
                    </div>`;
        this.searchContainer.prepend(searchBar);

        document.getElementById("friend-search").addEventListener('keyup', (e) => {
            e.preventDefault();
            if (this.activeRequest.cancel)
                this.activeRequest.cancel;

            vkService.searchFriends(this.activeRequest, e.target.value).then((res) => {
                showFriends(res, this.component);
            });
        });
    };

    /**
     * Create DOM element
     * @param name {String}
     * @param img {String}
     * @returns {Element}
     */
    function createFriend(user) {

        let div = document.createElement('div');
        if (typeof user !== 'object')
            return div;

        div.className += "conversation__message new";
        div.dataset.id = user.id;
        div.innerHTML = `<img class="conversation__avatar" src="${user.photo}">
                            <div class="conversation__message-info">
                                <h4 class="conversation__name">${user.firstName} ${user.lastName}</h4>
                            </div>
                            <div class="conversation__message-info">
                                <h4 class="conversation__name conversation__name_right">
                                    <span class="conversation__message-count">169</span>
                                    <span class="conversation__message-time">1 min</span>
                                </h4>
                                <p class="conversation__message-text conversation__name_right"><i
                                        class="conversation__attachment"></i></p>
                            </div>`;
        return div;
    }

    /**
     * Create document fragment from list
     * @param data {Vk_API_data}
     * @returns {DocumentFragment}
     */
    function createListFragment(data, nodeCreateFn) {

        let fragment = document.createDocumentFragment();

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            fragment.appendChild(nodeCreateFn(item));
        }
        return fragment;
    }

    function showFriends(users, component) {
        if (users.length > 0) {
            document.getElementById('messages-container').innerHTML = '';
            component.innerHTML = '';
            component.appendChild(createListFragment(users, createFriend));
            document.getElementById('messages-container').appendChild(component);
        }
    }

    function createDialogsColumn() {
        let div = document.createElement('div');
        div.classList.add('content__right-column');
        //language=HTML
        div.innerHTML = `
            <div class="conversation">
                <div id="friends-search-container"></div>
                <div class="conversation__messages" id="dialogs-container"></div>
            </div>`;

        return div;
    }

    function createChatContainer() {
        let div = document.createElement('div');
        div.classList.add('content__text-container');
        //language=HTML
        div.innerHTML = `
            <section class="chart">
                <div class="chart__messages" id="messages-container"></div>
            </section>`;
        return div;
    }

    app.friendsComponent = FriendsComponent;
})();
