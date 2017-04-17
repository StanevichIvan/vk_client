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
        this.messagesContainer = document.getElementById('messages-container');
        this.dialogsContainer = document.getElementById('dialogs-container');
        this.chartForm = document.getElementById("chart-form");
        this.messageInput = document.getElementById("message-input");
        this.scrollDownButton = document.getElementById("scroll-bottom");

        this.newMessage = (messages) => {
            let arr = [];

            messages.forEach((item) => {
                let obj = {};
                obj.out = 0;
                obj.body = item[6];
                obj.user = item[3];
                obj.out = item[3] === parseInt(this.userID, 10) ? 1 : 0;
                arr.push(new window.app.model.Dialog(obj));
            });
            this.messages.push(arr);

            if (this.messagesContainer.scrollTop === this.messagesContainer.scrollHeight) {
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
            });
        }.bind(this);

        this.dialogSelect = function (event) {
            const id = event.target.closest('.conversation__message').dataset.id;
            this.userID = event.target.closest('.conversation__message').dataset.id;
            this.showUserMessages(id);
        }.bind(this);


        this.scrollMessagesToBottom = () => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.scrollDownButton.classList.remove('show');
        };

        this.showScrollToButtom = () => {
            this.scrollDownButton.classList.add('show');
        };

        this.messagesContainer.addEventListener('scroll', (e)=> {
            let elem = e.target;
            if(elem.scrollTop === elem.scrollHeight - 1000)
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

        vkService.getMessages(this.activeRequest, uid)
            .then((messages) => {
                this.messages = messages;
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