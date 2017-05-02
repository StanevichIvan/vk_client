(function () {

    const vkService = window.app.xhrService;

    /**
     * @param mountNode
     * @constructor
     */
    function MessageForm(mountNode, props) {
        this.activeRequest = {};
        this.id = props.id;
        this.type = props.type;
        this.mountNode = mountNode;
        this.senderImg = '';

        this.loadAvatar();
    }

    MessageForm.prototype.loadAvatar = function () {
        let userID = window.localStorage.getItem('currentUser');

        vkService.getUsersProfiles(this.activeRequest, userID)
            .then((res) => {
                if(!res[0])
                    debugger;
                this.senderImg = res[0].photo_50;
            })
            .then(() => {
                this.render();
            });
    };

    MessageForm.prototype.render = function () {
        let div = document.createElement('div');
        //language=HTML
        div.innerHTML = `
            <form class="chart__form" id="chart-form">
                <div class="chart__input-wrap">
                    <div class="chart__input"><input placeholder="Your message" name="message" id="message-input">
                        <div class="chart__file-upload">
                            <input id="file-upload" name="image" type="file">
                        </div>
                        <div id="docs-select" class="docs-select chart__docs-select">
                            <div id="docs-select-list" class="docs-select__list"></div>
                            <button id="docs-select__button" class="docs-select__button" type="button">Attach uploaded
                                file
                            </button>
                        </div>
                    </div>
                    <button class="chart__input-button" type="submit">Send</button>
                </div>
                <img class="chart__form-avatar" src="${this.senderImg}">
            </form>`;

        div.querySelector('#chart-form').addEventListener('submit', (e) => {
            this.formSubmit(e);
        });

        div.querySelector('#file-upload').addEventListener('change', (e) => {
            vkService.messagesPhotoUploadServer({})
                .then((res) => {
                    return vkService.messagesPhotoUpload({}, res, e.target);
                })
                .then((res) => {
                    debugger;
                });
        });

        div.querySelector('#docs-select__button').addEventListener('click', () => {
            div.querySelector('#docs-select-list').classList.toggle('active');
        });

        new window.app.docsComponent({
            container: div.querySelector('#docs-select-list'),
            userID: this.id
        });

        this.mountNode.appendChild(div);
    };

    MessageForm.prototype.formSubmit = function (event) {
        event.preventDefault();

        const message = event.target.message.value;
        if (this.type === 'dialog') {
            vkService.sendMessage(this.id, message).then(() => {
                // this.messageInput.value = '';
                document.getElementsByClassName('emojionearea-editor')[0].innerHTML = '';
            });
        } else if (this.type === 'chat') {
            vkService.sendChatMessage({}, this.id, message).then(() => {
            });
        }
    };


    app.messageForm = MessageForm;
})();