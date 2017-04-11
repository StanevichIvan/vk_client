var conversationComponent = (function () {

    const vkService = window.xhrService;

    /**
     * @param mountNode
     * @constructor
     */
    function Conversations(mountNode) {
        this.mountNode = mountNode;
        this.showDialogs();

        let messageInterval;
        document.getElementById("chart-form").addEventListener('submit', (event) => {
            event.preventDefault();
            const message = event.target.message.value;
            const id = event.target.dataset.id;
            vkService.sendMessage(id, message).then((res) => {
                this.showUserMessages(id);
            });
        });

        document.getElementById('dialogs-container').addEventListener('click', (event) => {
            const uid = event.target.closest('.conversation__message').dataset.id;
            this.showUserMessages(uid);

            clearInterval(messageInterval);
            messageInterval = setInterval(() => {
                this.showUserMessages(uid);
            }, 2000);
        });

        this.destroy = function () {
            clearInterval(messageInterval);
            document.getElementById('dialogs-container').innerHTML = '';
            document.getElementById('messages-container').innerHTML = '';
        }

    }

    /**
     * Shows dialogs into container
     * @param data
     */
    Conversations.prototype.showDialogs = function () {
        let dialogs;
        vkService.getDialogs().then((res) => {
            return res.json();
        }).then((json) => {
            let idList = json.response.map((item) => {
                if (item.uid)
                    return item.uid;
                return '';
            });
            dialogs = json.response;
            return vkService.getUsersProfiles(idList);
        }).then((res) => {
            return res.json();
        }).then((res) => {
            this.renderDialogs(mergeDialogsInfo(res.response, dialogs));
        }).catch((err) => {
            alert(err);
        });
    };

    /**
     * Merge data from two requests
     * @param userData {Array}
     * @param dialogs {Array}
     * @returns {Array}
     */
    var mergeDialogsInfo = function (userData, dialogs) {
        let diaolgsBundle = [];

        dialogs.forEach((item) => {
            if (typeof item === 'object') {
                userData.forEach((user) => {
                    if (item.uid === user.uid) {
                        let resObj = Object.assign({}, item);
                        resObj['photo_50'] = user.photo_50;
                        resObj['first_name'] = user.first_name;
                        resObj['last_name'] = user.last_name;
                        diaolgsBundle.push(resObj);
                    }
                });
            }
        });
        return diaolgsBundle;
    };

    Conversations.prototype.renderDialogs = function renderDialogs(data) {
        document.getElementById('dialogs-container').appendChild(this.createListFragment(data, dialogRender));
    };

    /**
     * Create document fragment from list
     * @param data {Vk_API_data}
     * @returns {DocumentFragment}
     */
    Conversations.prototype.createListFragment = function (data, nodeCreateFn) {

        let fragment = document.createDocumentFragment();

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            // fragment.appendChild(nodeCreateFn(`${user.first_name} ${user.last_name}`, user.photo_50));
            fragment.appendChild(nodeCreateFn(item));
        }
        return fragment;
    };

    Conversations.prototype.showUserMessages = function (uid) {

        vkService.getMessages(uid)
            .then((res) => {
                return res.json();
            }).then((res) => {
            this.renderMesasges(res.response);
        });

        document.getElementById('chart-form').dataset.id = uid;
    };

    /**
     * @param data
     */
    Conversations.prototype.renderMesasges = function (data) {
        const container = document.getElementById('messages-container');
        container.innerHTML = "";
        container.appendChild(this.createListFragment(data.reverse(), messageRender));
        container.scrollTop = container.scrollHeight;
    };

    /**
     *
     * @returns {Element}
     */
    var messageRender = function (item) {
        let div = document.createElement('div');

        if (typeof item !== 'object') {
            return div;
        }
        // skip link messages
        if (item.body.length === 0) {
            div.style.display = 'none';
            return div;
        }


        div.className += "chart-message";
        if (item.out === 1) {
            div.className += " mine";
        }

        div.innerHTML = `<div class="chart-message__avatar">
                            <div class="chart-message__avatar-content active">
                                <img src="images/photo.png">
                                <div class="chart-message__controls">
                                    <span class="chart-message__control chart-message__control_star"></span>
                                    <span class="chart-message__control chart-message__control_share"></span>
                                </div>
                            </div>
                        </div>
                        <div class="chart-message__time">
                            <!--<span>15 sec.</span>-->
                        </div>
                        <div class="chart-message__content">
                            <p class="chart-message__text">
                               ${item.body}
                            </p>

                        </div>`;

        return div;
    }

    /**
     * render dom element for message
     * @param item
     * @returns {Element}
     */
    var dialogRender = function (item) {
        let div = document.createElement('div');

        if (typeof item !== 'object')
            return div;

        div.dataset.id = item.uid;
        div.className += "conversation__message new";
        div.innerHTML = `<img class="conversation__avatar" src="${item.photo_50}">
                            <div class="conversation__message-info">
                                <h4 class="conversation__name">${item.first_name} ${item.last_name}</h4>
                                <p class="conversation__message-text">${item.body}</p>
                            </div>
                            <div class="conversation__message-info">
                                <h4 class="conversation__name conversation__name_right">
                                    <span class="conversation__message-count">${item.out}</span>
                                    <span class="conversation__message-time">1 min</span>
                                </h4>
                                <p class="conversation__message-text conversation__name_right"><i
                                        class="conversation__attachment"></i></p>
                            </div>`;
        return div;
    };


    return Conversations;
})();
