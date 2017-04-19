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
        this.mountNode.appendChild(createNewsList(news));
    };

    function createNewsList(news) {

        let div = document.createElement('ul');

        for (let i = 0; i < news.items.length; i++) {

            let li = document.createElement('li');
            li.innerhtml = '123123';// `${news.items[i].text}`;
            div.appendChild(li);
        }

        return div;
    }

    app.newsComponent = NewsComponent;
})();
