(function () {

    const vkService = window.app.xhrService;

    /**
     * @param mountNode
     * @constructor
     */
    function Chat(mountNode, props) {
        this.mountNode = mountNode;
        this.ID = props.id;
        this.activeRequest = {};
        this.chatFormContainer = document.getElementById('chat');

        this.render();

        this.chatMessages = new window.app.chatMessagesComponent(document.getElementById('chat'),
            {
                messagesContainer: document.getElementById('messages-container'),
                id: this.ID, type: props.type
            });

        this.chatMessageFormSend = new window.app.messageForm(this.chatFormContainer, {
            id: this.ID,
            type: props.type
        });
    }

    Chat.prototype.render = function () {
        this.mountNode.innerHTML = `<div class="chart__messages" id="messages-container"></div>
        <span class="chart__scroll-to-bottom" id="scroll-bottom">&darr;</span>`;
    };

    Chat.prototype.destroy = function () {
        this.mountNode.innerHTML = '';
    };

    app.chatComponent = Chat;
})();