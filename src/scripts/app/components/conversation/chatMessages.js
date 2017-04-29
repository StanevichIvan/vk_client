(function () {

    const vkService = window.app.xhrService;

    /**
     * @param mountNode
     * @constructor
     */
    function ChatMessages(mountNode, props) {
        this.mountNode = mountNode;
        this.activeRequest = {};
        this.messagesContainer = props.messagesContainer;
        this.id = props.id;
        this.messages = [];

        this.messagesContainer.addEventListener('scroll', (e) => {
            let elem = e.target;
            if (elem.scrollTop + this.messagesContainer.clientHeight === elem.scrollHeight) {
                // this.scrollDownButton.classList.remove('show');
            }
        });

        if (props.type === 'chat') {
            vkService.getChatMessages(this.activeRequest, this.id)
                .then((res) => {
                    this.renderMessages(res);
                });
        } else {
            vkService.getMessages(this.activeRequest, this.id)
                .then((res) => {
                    this.renderMessages(res);
                });
        }

        this.render();
    }

    ChatMessages.prototype.render = function () {
        window.app.messagesObserver.subscribe(this.newMessage.bind(this));
        vkService.longPoll();
    };

    ChatMessages.prototype.destroy = function () {
        window.app.messagesObserver.unsubscribe(this.newMessage);
    };

    ChatMessages.prototype.newMessage = function (messages) {
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
        // this.messages.push(arr);

        if (this.messagesContainer.scrollTop + this.messagesContainer.clientHeight === this.messagesContainer.scrollHeight) {
            this.messagesContainer.appendChild(this.createListFragment(arr.reverse(), this.messageRender));
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        } else {
            this.messagesContainer.appendChild(this.createListFragment(arr.reverse(), this.messageRender));
            this.showScrollToButtom();
        }
    };

    ChatMessages.prototype.scrollMessagesToBottom = function () {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        this.scrollDownButton.classList.remove('show');
    };

    ChatMessages.prototype.showScrollToButtom = function () {
        this.scrollDownButton.classList.add('show');
    };

    ChatMessages.prototype.showUserMessages = function (uid) {
        vkService.getMessages(this.activeRequest, uid)
            .then((messages) => {
                this.renderMessages(messages);
            });
    };

    /**
     * Create document fragment from list
     * @param data {Vk_API_data}
     * @returns {DocumentFragment}
     */
    ChatMessages.prototype.createListFragment = function (data, nodeCreateFn) {

        let fragment = document.createDocumentFragment();

        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            fragment.appendChild(nodeCreateFn.bind(this)(item));
        }
        return fragment;
    };


    ChatMessages.prototype.renderMessages = function (messages) {
        this.messagesContainer.innerHTML = "";
        this.messagesContainer.appendChild(this.createListFragment(messages.reverse(), this.messageRender));
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    };
    /**
     *
     * @param message {Dialog}
     * @returns {Element}
     */
    ChatMessages.prototype.messageRender = function (message) {
        let div = document.createElement('div');

        if (typeof message !== 'object') {
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


        if (message.attach && message.attach.type === 'doc') {
            let doc = document.createElement('div');
            doc.innerHTML = `<a target="_blank" href='${message.attach.doc.url}'>${message.attach.doc.title}</a>`;
            div.querySelector('.chart-message__text').appendChild(doc);
            return div;
        }

        // skip link messages
        if (message.body.length === 0 ) {
            div.style.display = 'none';
            return div;
        }

        return div;

    };

    app.chatMessagesComponent = ChatMessages;
})();
