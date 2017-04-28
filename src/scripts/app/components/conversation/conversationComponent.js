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

        this.multichatSelect = function () {
            this.chat = new window.app.chatComponent(document.getElementById('chat'), {id: this.userID});
        };

        // this.chartUsers = new window.app.chatUsersComponent({
        //     mount: document.getElementById('friends-search-container'),
        //     chatSelectFunc: this.multichatSelect
        // });

        this.showDialogs();
    }

    Conversations.prototype.destroy = function () {
        this.dialogsContainer.innerHTML = '';

        this.container.innerHTML = '';
        window.app.messagesObserver.unsubscribeAll();

        if (this.activeRequest.cancel)
            this.activeRequest.cancel();
    };

    /**
     * Shows dialogs into container
     * @param data
     */
    Conversations.prototype.showDialogs = function () {

        vkService.getDialogs(this.activeRequest)
            .then((res) => {
                this.renderDialogs(res);
            }).catch((err) => {
        });
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
            fragment.appendChild(nodeCreateFn.bind(this)(item));
        }
        return fragment;
    };

    Conversations.prototype.renderDialogs = function renderDialogs(data) {
        document.getElementById('dialogs-container').appendChild(this.createListFragment(data, this.dialogRender));
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

        div.addEventListener('click', (e) => {
            e.stopPropagation();
            let dia = new window.app.chatComponent(document.getElementById('chat'), {id: dialog.user.id, type: 'dialog'});
        });

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
            let chat = new window.app.chatComponent(document.getElementById('chat'), {id: dialog.id, type: 'chat'});
        });
        return div;
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
            <section class="chart" id="chat">
                <div class="chart__messages" id="messages-container"></div>
                <span class="chart__scroll-to-bottom" id="scroll-bottom">&darr;</span>
                <form class="chart__form" id="chart-form">
                    <div class="chart__input-wrap">
                        <div class="chart__input"><input placeholder="Your message" name="message" id="message-input">
                            <div class="chart__file-upload"><input id="file-upload" name="image" type="file"></div>
                            <div id="docs-select" class="docs-select chart__docs-select">
                                <div id="docs-select-list" class="docs-select__list"></div>
                                <button id="docs-select__button" class="docs-select__button" type="button">Attach file
                                </button>
                            </div>
                        </div>
                        <button class="chart__input-button" type="submit">Send</button>
                    </div>
                    <img src="images/photo.png"></form>
            </section>`;

        div.querySelector('#file-upload').addEventListener('change', (e) => {
            vkService.messagesPhotoUploadServer({}).then((res) => {
                return vkService.messagesPhotoUpload({}, res, e.target);
            }).then((res) => {
            });
        });

        div.querySelector('#docs-select__button').addEventListener('click', () => {
            div.querySelector('#docs-select-list').classList.toggle('active');
        });

        new window.app.docsComponent({
            container: div.querySelector('#docs-select-list')
        });

        return div;
    }

    app.conversationComponent = Conversations;
})();