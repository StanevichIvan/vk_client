var router = (function () {

    var components = {
        dialogs: window.conversationComponent
    };

    function Router() {

        if (window.location.pathname !== '/') {
            let path = window.location.pathname.replace('/', '');
        }

        // listen nav controls
        window.onpopstate = history.onpushstate = (e) => {
            if (e.state !== null) {
                this.renderComponent(e.state.component);
            } else {
                this.renderComponent('blank');
            }
        };
        this.renderComponent = function (componentName) {
            switch (componentName.toLowerCase()) {
                case 'messages':
                    let messages = new components.dialogs();
                    history.pushState({component: componentName}, componentName, componentName.toLowerCase());
                    break;
                case 'blank':
                    document.getElementById('dialogs-container').innerHTML = '';
                    break;
            }
        };
    }

    return Router;
})();
