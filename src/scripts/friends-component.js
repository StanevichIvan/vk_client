var friendsComponent = (function () {

    const vkService = window.xhrService;

    function FriendsComponent(mountNode) {
        this.render();
        this.mountNode = 'messages-container';
        this.destroy = function() {
            document.getElementById(this.mountNode).innerHTML= '';
        };
    }

    FriendsComponent.prototype.render = function () {
        vkService.getFriends().then((res)=> {
            showFriends(res);
        });
    };

    /**
     * Create DOM element
     * @param name {String}
     * @param img {String}
     * @returns {Element}
     */
    function createFriend(item) {

        let div = document.createElement('div');
        div.className += "conversation__message new";
        div.innerHTML = `<img class="conversation__avatar" src="${item.photo_50}">
                            <div class="conversation__message-info">
                                <h4 class="conversation__name">${item.first_name} ${item.last_name}</h4>
                                <!--<p class="conversation__message-text">Of course!</p>-->
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

    function showFriends(data) {
        if (data.response.length > 0) {
            document.getElementById('messages-container').innerHTML = '';
            document.getElementById('messages-container').appendChild(createListFragment(data.response, createFriend));
        }
    }


    return FriendsComponent;
})();
