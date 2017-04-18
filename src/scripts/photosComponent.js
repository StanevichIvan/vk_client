(function () {

    const vkService = window.app.xhrService;

    function PhotosComponent(obj) {
        this.activeRequest = {};
        this.mountNode = document.getElementById('router-outlet');
        this.component = document.createElement('div');
        this.component.classList.add('slider');
        this.photos = [];
        this.animation;
        this.userId = obj.userId;
        this.albumId = obj.albumId;

        this.loadPhotos = () => {
            vkService.getAlbumPhotos(this.activeRequest, this.userId, this.albumId)
                .then((res) => {
                    this.photos = res;
                    this.render(this.photos);
                })
                .catch((err) => {
                    console.log(err);
                });
        };

        this.loadPhotos();

        this.createSlider = () => {
            let fragment = document.createDocumentFragment();
            let animation = calcAnimationProps(this.photos);

            this.photos.forEach((item) => {
                const img = document.createElement('div');
                img.style.backgroundImage = `url('${item.src}')`;
                fragment.appendChild(img);
            });
            let figure = document.createElement('figure');

            figure.animate(animation.keyframes, animation.options);
            figure.appendChild(fragment);
            figure.style.width = animation.containerWidth;

            return figure;
        };

        function calcAnimationProps(photos) {

            let keyframes = [];
            let startTransform = 0;
            let transformStep = 100 / photos.length;
            let duration = 0;
            let width = 0;

            photos.forEach((item) => {
                keyframes.push({transform: `translate(${startTransform}%)`});
                keyframes.push({transform: `translate(${startTransform}%)`});
                startTransform -= transformStep;
                duration += 2000;
                width += 100;
            });

            return {
                keyframes: keyframes,
                options: {duration: duration, iterations: Infinity},
                containerWidth: `${width}%`,
                imgWidth: transformStep
            }
        }
    }

    PhotosComponent.prototype.destroy = function () {
        // if (this.component.parentNode)
        //     this.component.parentNode.removeChild(this.component);
        //
        this.mountNode.innerHTML = '';
    };

    PhotosComponent.prototype.render = function () {
        this.component.appendChild(this.createSlider());
        this.mountNode.appendChild(this.component);
    };

    function createDialogsColumn() {
        let div = document.createElement('div');
        div.classList.add('content__right-column');
        //language=HTML
        div.innerHTML = `
            <div class="conversation">
                <div id="friends-search-container"></div>
                <div class="conversation__messages" id="dialogs-container"></div>
            </div>`;

        return div;
    }

    function createChatContainer() {
        let div = document.createElement('div');
        div.classList.add('content__text-container');
        //language=HTML
        div.innerHTML = `
            <section class="chart">
                <div class="chart__messages" id="messages-container"></div>

                <span class="chart__scroll-to-bottom" id="scroll-bottom">&darr;</span>
                <form class="chart__form" id="chart-form">
                    <div class="chart__input-wrap">
                        <div class="chart__input">
                            <input placeholder="Your message" name="message" id="message-input">
                        </div>
                        <button class="chart__input-button" type="submit">Send</button>
                    </div>
                    <img src="images/photo.png">
                </form>
            </section>`;
        return div;
    }

    app.photosComponent = PhotosComponent;
})();
