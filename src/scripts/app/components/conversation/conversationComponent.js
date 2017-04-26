(function () {

    const vkService = window.app.xhrService;

    /**
     * @param mountNode
     * @constructor
     */
    function Conversations(mountNode) {
        this.mountNode = mountNode;
        this.userID = 0;
        this.messages = [];
        this.activeRequest = {};
        this.messages = [];
        this.container = document.getElementById('router-outlet');
        this.dialogsContainer = createDialogsColumn();
        this.chatContainer = createChatContainer();

        this.container.appendChild(this.dialogsContainer);
        this.container.appendChild(this.chatContainer);

        this.messagesContainer = document.getElementById('messages-container');
        this.chartForm = document.getElementById("chart-form");
        this.messageInput = document.getElementById("message-input");
        this.scrollDownButton = document.getElementById("scroll-bottom");
        this.chartUsers = new window.app.chatUsersComponent({
            mount: document.getElementById('friends-search-container'),
            select: this.startMultiuserChat
        });

        this.newMessage = (messages) => {
            let arr = [];

            messages.forEach((item) => {
                let obj = {
                    body: item[6],
                    user: item[3],
                    out: 0
                };
                obj.out = item[3] === parseInt(this.userID, 10) ? 1 : 0;
                arr.push(new window.app.model.Dialog(obj));
            });
            this.messages.push(arr);

            if (this.messagesContainer.scrollTop + this.messagesContainer.clientHeight === this.messagesContainer.scrollHeight) {
                this.messagesContainer.appendChild(this.createListFragment(arr.reverse(), messageRender));
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            } else {
                this.messagesContainer.appendChild(this.createListFragment(arr.reverse(), messageRender));
                this.showScrollToButtom();
            }
        };

        this.formSubmit = function (event) {
            event.preventDefault();
            const message = event.target.message.value;
            vkService.sendMessage(this.userID, message).then(() => {
                this.messageInput.value = '';
                document.getElementsByClassName('emojionearea-editor')[0].innerHTML = '';
            });
        }.bind(this);

        this.dialogSelect = function (event) {
            if (event.target.classList.contains('conversation__message')) {
                const id = event.target.closest('.conversation__message').dataset.id;
                this.userID = event.target.closest('.conversation__message').dataset.id;
                this.showUserMessages(id);
            }
        }.bind(this);


        this.scrollMessagesToBottom = () => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.scrollDownButton.classList.remove('show');
        };

        this.showScrollToButtom = () => {
            this.scrollDownButton.classList.add('show');
        };

        this.messagesContainer.addEventListener('scroll', (e) => {
            let elem = e.target;
            if (elem.scrollTop + this.messagesContainer.clientHeight === elem.scrollHeight)
                this.scrollDownButton.classList.remove('show');
        });

        this.chartForm.addEventListener('submit', this.formSubmit);
        this.dialogsContainer.addEventListener('click', this.dialogSelect);
        this.scrollDownButton.addEventListener('click', this.scrollMessagesToBottom);

        this.destroy = function () {
            this.chartForm.removeEventListener('submit', this.formSubmit);
            this.dialogsContainer.removeEventListener('click', this.dialogSelect);
            this.scrollDownButton.removeEventListener('click', this.scrollMessagesToBottom);
            this.dialogsContainer.innerHTML = '';
            this.messagesContainer.innerHTML = '';

            this.container.innerHTML = '';
            window.app.messagesObserver.unsubscribeAll();

            if (this.activeRequest.cancel)
                this.activeRequest.cancel();
        }.bind(this);

        this.showDialogs();
        vkService.longPoll();
        window.app.messagesObserver.subscribe(this.newMessage);
    }

    /**
     * Shows dialogs into container
     * @param data
     */
    Conversations.prototype.showDialogs = function () {

        vkService.getDialogs(this.activeRequest)
            .then((res) => {
                this.renderDialogs(res);
            }).catch((err) => {
            alert(err);
        });
    };

    Conversations.prototype.startMultiuserChat = function (arr) {

        vkService.createMultiuserChat(this.activeRequest, arr)
            .then((res) => {

            });
        // this.showUserMessages();
    };


    Conversations.prototype.renderDialogs = function renderDialogs(data) {
        document.getElementById('dialogs-container').appendChild(this.createListFragment(data, this.dialogRender));
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
            fragment.appendChild(nodeCreateFn.bind(this)(item));
        }
        return fragment;
    };

    Conversations.prototype.showUserMessages = function (uid) {
        this.chartForm.dataset.id = uid;

        vkService.getMessages(this.activeRequest, uid)
            .then((messages) => {
                this.messages = messages;
                this.renderMessages.bind(this)(messages);
            });
    };

    Conversations.prototype.renderMessages = function (messages) {
        const container = document.getElementById('messages-container');
        container.innerHTML = "";
        container.appendChild(this.createListFragment(messages.reverse(), messageRender));
        container.scrollTop = container.scrollHeight;
    };

    /**
     * render dom element for message
     * @param dialog
     * @returns {Element}
     */
    Conversations.prototype.dialogRender = function (dialog) {
        let div = document.createElement('div');

        if (typeof dialog !== 'object') {
            return div;
        }

        if (dialog instanceof window.app.model.Chat) {
            return createChartListItem.bind(this)(dialog);
        }

        div.dataset.id = dialog.user.id;
        div.className += "conversation__message new";
        //language=HTML
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

    function createChartListItem(dialog) {
        let div = document.createElement('div');
        div.className += "conversation__message new";
        div.innerHTML = `<img class="conversation__avatar" >
                            <div class="conversation__message-info">
                                <h4 class="conversation__name">${dialog.title}</h4>
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

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            vkService.getChatMessages(this.activeRequest, dialog.id)
                .then((res) => {
                    this.renderMessages([]);
                });
        });
        return div;
    }
    /**
     *
     * @param message {Dialog}
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

                <span class="chart__scroll-to-bottom" id="scroll-bottom">&darr;</span>
                <form class="chart__form" id="chart-form">
                    <div class="chart__input-wrap">
                        <div class="chart__input">
                            <input placeholder="Your message" name="message" id="message-input">
                        </div>
                        <button class="chart__input-button" type="submit">Send</button>
                    </div>
                    <img src="images/photo.png">
                </form>
            </section>`;
        return div;
    }

    app.conversationComponent = Conversations;
})();