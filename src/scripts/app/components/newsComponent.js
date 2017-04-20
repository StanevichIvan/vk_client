(function () {

    const vkService = window.app.xhrService;

    function NewsComponent(obj) {
        this.activeRequest = {};
        this.mountNode = document.getElementById('router-outlet');

        this.init = () => {
            vkService.getNews(this.activeRequest)
                .then((res) => {
                    this.render(res);
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        this.init();
    }

    NewsComponent.prototype.destroy = function () {
        this.mountNode.innerHTML = '';
    };

    NewsComponent.prototype.render = function (news) {
        const container = document.createElement('div');
        container.classList.add('news');
        container.appendChild(createNewsList(news));
        this.mountNode.appendChild(container);
    };

    function createNewsList(news) {

        let fragment = document.createDocumentFragment();

        for (let i = 0; i < news.length; i++) {

            let item = news[i];
            let div = document.createElement('div');
            div.classList.add('news__item');
            let element;
            switch (item.type) {
                case 'event':
                    element = createEvent(item);
                    break;

                case 'post':
                    element = createPost(item);
                    break;

                case 'wall_photo':
                    element = createWallPhotos(item);
                    break;

                case 'video':
                    element = createVideo(item);
                    break;
            }

            if (element)
                div.appendChild(element);

            fragment.appendChild(div);
        }

        return fragment;
    }

    function createEvent(obj) {
        let div = document.createElement('div');
        //language=HTML
        div.innerHTML = `<h3>${obj.name}</h3>
<img src="${obj.img}">            
        `;

        return div;
    }

    function createPost(obj) {

        let div = document.createElement('div');
        div.innerHTML = `<h3>${obj.name}</h3>`;
        obj.photos.forEach((item) => {
            let img = document.createElement('img');
            img.src = item;
            div.appendChild(img);
        });

        return div;
    }

    function createWallPhotos(obj) {
        let div = document.createElement('div');

        obj.photos.forEach((item) => {
            let img = document.createElement('img');
            img.src = item;
            div.appendChild(img);
        });

        return div;
    }

    function createVideo(obj) {

        let div = document.createElement('div');

        obj.videos.forEach((item) => {
            let img = document.createElement('img');
            img.src = item.image;
            div.appendChild(img);
            div.innerHTML += item.title;
            vkService.getVideo({}, item.id, item.ownerID);
        });

        return div;
    }

    app.newsComponent = NewsComponent;
})();
