(function () {

    var components = {
        dialogs: window.app.conversationComponent,
        friends: window.app.friendsComponent,
        photos: window.app.photosComponent,
        albums: window.app.albumsComponent
    };

    function Router() {

        this.prevComponent= {};

        // listen nav controls
        window.onpopstate = history.onpushstate = (e) => {
            if (e.state !== null) {
                this.renderComponent(e.state.component, e.state.props);
            } else {
                this.renderComponent('blank');
            }
        };
        this.renderComponent = function (componentName, props) {

            if (this.prevComponent.destroy) {
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

                case 'photos':
                    let photos = new components.photos(props);
                    history.pushState({component: componentName}, componentName, componentName.toLowerCase());
                    this.prevComponent = photos;
                    break;

                case 'albums':
                    let albums = new components.albums(props);
                    history.pushState({component: componentName, props: props}, componentName, componentName.toLowerCase());
                    this.prevComponent = albums;
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

    app.router = new Router();
})();
