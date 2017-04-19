(function () {

    const vkService = window.app.xhrService;

    function AlbumsComponent(id) {

        this.activeRequest = {};
        this.container = document.getElementById('router-outlet');
        this.component = document.createElement('div');
        this.component.classList.add('albums');
        this.albums = [];
        this.id = id;

        this.loadAlbums = () => {
            vkService.getAlbums(this.activeRequest, this.id)
                .then((res) => {
                    this.albums = res;
                    this.render();
                }).catch((err) => {
                // console.log(err);
            });
        };

        this.loadAlbums();
    }

    AlbumsComponent.prototype.destroy = function () {
        this.component.innerHTML = '';
        this.container.innerHTML = '';
    };

    AlbumsComponent.prototype.render = function () {
        this.component.appendChild(this.createAlbumTumb(this.albums));
        this.container.appendChild(this.component);
    };

    AlbumsComponent.prototype.createAlbumTumb = function(albumList) {
        let fragment = document.createDocumentFragment();

        for (let i = 0; i < albumList.length; i++) {
            fragment.appendChild(this.renderThumb(albumList[i]));
        }

        return fragment;
    };

    AlbumsComponent.prototype.renderThumb = function(obj) {
        let div = document.createElement('div');
        div.classList.add('albums__tumb');
        div.dataset.id = obj.id;
        div.style.backgroundImage = `url('${obj.coverSrc}')`;
        div.innerHTML = `<p class="albums__tumb-text">${obj.title}</p>`;

        div.addEventListener('click', (e)=> {
            window.app.router.renderComponent('photos', {userId: this.id, albumId: obj.id});
        });

        return div;
    };

    app.albumsComponent = AlbumsComponent;
})();