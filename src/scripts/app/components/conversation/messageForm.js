(function () {

    const vkService = window.app.xhrService;
    /**
     * @param mountNode
     * @constructor
     */
    function MessageForm(mountNode, props) {
        this.id = props.id;


    }

    MessageForm.prototype.render = function () {

    };

    MessageForm.prototype.formSubmit = function (event) {
        event.preventDefault();
        const message = event.target.message.value;
        vkService.sendMessage(this.userID, message).then(() => {
            this.messageInput.value = '';
            document.getElementsByClassName('emojionearea-editor')[0].innerHTML = '';
        });
    };


    app.messageForm = MessageForm;
})();
