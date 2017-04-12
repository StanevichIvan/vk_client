(function () {

    const vkService = window.app.xhrService;

    /**
     * @param mountNode
     * @constructor
     */
    function Conversations(mountNode) {
        this.mountNode = mountNode;
        this.showDialogs();

        this.activeRequest = null;
        this.messageInterval = {};

        document.getElementById("chart-form").addEventListener('submit', (event) => {
            event.preventDefault();
            const message = event.target.message.value;
            const id = event.target.dataset.id;
            vkService.sendMessage(id, message).then((res) => {
                this.showUserMessages(id);
            });
        });

        document.getElementById('dialogs-container').addEventListener('click', (event) => {
            const id = event.target.closest('.conversation__message').dataset.id;
            this.showUserMessages(id);

            clearInterval(this.messageInterval);
            this.messageInterval = setInterval(this.showUserMessages(id)
            , 2000);

        });

        this.destroy = function () {
            clearInterval(this.messageInterval);
            document.getElementById('dialogs-container').innerHTML = '';
            document.getElementById('messages-container').innerHTML = '';
        }
    }

    /**
     * Shows dialogs into container
     * @param data
     */
    Conversations.prototype.showDialogs = function () {

        vkService.getDialogs()
            .then((res) => {
                this.renderDialogs(res);
            }).catch((err) => {
            alert(err);
        });
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
        document.getElementById('chart-form').dataset.id = uid;

        vkService.getMessages(uid)
            .then((messages) => {
                this.renderMesasges(messages);
            });
    };

    Conversations.prototype.renderMesasges = function (messages) {
        const container = document.getElementById('messages-container');
        container.innerHTML = "";
        container.appendChild(this.createListFragment(messages.reverse(), messageRender));
        container.scrollTop = container.scrollHeight;
    };

    /**
     *
     * @returns {Element}
     */
    var messageRender = function (message) {
        let div = document.createElement('div');

        if (typeof message !== 'object') {
            return div;
        }
        // skip link messages
        if (message.body.length === 0) {
            div.style.display = 'none';
            return div;
        }


        div.className += "chart-message";
        if (message.out === 1) {
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
                               ${message.body}
                            </p>

                        </div>`;

        return div;
    };

    /**
     * render dom element for message
     * @param dialog
     * @returns {Element}
     */
    var dialogRender = function (dialog) {
        let div = document.createElement('div');

        if (typeof dialog !== 'object')
            return div;

        div.dataset.id = dialog.user.id;
        div.className += "conversation__message new";
        div.innerHTML = `<img class="conversation__avatar" src="${dialog.user.photo}">
                            <div class="conversation__message-info">
                                <h4 class="conversation__name">${dialog.user.firstName} ${dialog.user.lastName}</h4>
                                <p class="conversation__message-text">${dialog.body}</p>
                            </div>
                            <div class="conversation__message-info">
                                <h4 class="conversation__name conversation__name_right">
                                    <span class="conversation__message-count">${dialog.out}</span>
                                    <span class="conversation__message-time">1 min</span>
                                </h4>
                                <p class="conversation__message-text conversation__name_right"><i
                                        class="conversation__attachment"></i></p>
                            </div>`;
        return div;
    };

    app.conversationComponent = Conversations;
})();
