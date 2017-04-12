var router = (function () {

    var components = {
        dialogs: window.conversationComponent,
        friends: window.friendsComponent
    };

    function Router() {

        this.prevComponent;

        // listen nav controls
        window.onpopstate = history.onpushstate = (e) => {
            if (e.state !== null) {
                this.renderComponent(e.state.component);
            } else {
                this.renderComponent('blank');
            }
        };
        this.renderComponent = function (componentName) {

            if (this.prevComponent) {
                this.prevComponent.destroy();
            }

            switch (componentName.toLowerCase()) {
                case 'messages':
                    let messages = new components.dialogs();
                    history.pushState({component: componentName}, componentName, componentName.toLowerCase());
                    this.prevComponent = messages;
                    break;

                case 'friends':
                    let friends = new components.friends();
                    history.pushState({component: componentName}, componentName, componentName.toLowerCase());
                    this.prevComponent = friends;
                    break;
                case 'blank':
                    this.prevComponent.destroy();
                    break;
            }
        };

        if (window.location.pathname !== '/') {
            let path = window.location.pathname.replace('/', '');
            this.renderComponent(path);
        }

    }

    return Router;
})();
