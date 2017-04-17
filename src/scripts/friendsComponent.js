(function () {

    const vkService = window.app.xhrService;

    function FriendsComponent() {
        this.activeRequest = {};
        this.mountNode = document.getElementById('messages-container');
        this.destroy = function () {
            this.mountNode.innerHTML = '';
        };
        this.activeRequest = {};
        this.container = document.getElementById('messages-container');
        this.searchContainer = document.getElementById('friends-search-container');

        this.container.addEventListener('click', (e) => {

            if(e.target.classList.contains('conversation__message')) {
                let id = e.target.dataset.id;
                if (id) {
                    vkService.getPhotos(this.activeRequest, id);
                }

                window.app.router.renderComponent('photos', id);
            }
        });

        this.render();


        this.destroy = () => {
            if (this.activeRequest.cancel)
                this.activeRequest.cancel();

            this.container.innerHTML = '';
            this.searchContainer.innerHTML = '';
        };
    }

    FriendsComponent.prototype.render = function () {

        this.activeRequest = vkService.getFriends(this.activeRequest).then((res) => {
            showFriends(res);
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
                    </div>
`;
        this.searchContainer.prepend(searchBar);

        document.getElementById("friend-search").addEventListener('keyup', (e) => {
            e.preventDefault();
            if (this.activeRequest.cancel)
                this.activeRequest.cancel;

            vkService.searchFriends(this.activeRequest, e.target.value).then((res) => {
                showFriends(res);
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

    function showFriends(users) {
        if (users.length > 0) {
            document.getElementById('messages-container').innerHTML = '';
            document.getElementById('messages-container').appendChild(createListFragment(users, createFriend));
        }
    }

    app.friendsComponent = FriendsComponent;
})();
