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
        this.chatMessages = new window.app.chatMessagesComponent(document.getElementById('chat'),
            {messagesContainer: document.getElementById('messages-container'),
            id: this.ID});

        this.chatMessageFormSend = new window.app.messageForm(document.getElementById('chart-form'), {id: this.id});
    }

    Chat.prototype.render = function () {

    };

    Chat.prototype.destroy = function () {
        this.mountNode.innerHTML = '';
    };

    app.chatComponent = Chat;
})();