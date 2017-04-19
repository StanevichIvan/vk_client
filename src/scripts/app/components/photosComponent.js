(function () {

    const vkService = window.app.xhrService;

    function PhotosComponent(obj) {
        this.activeRequest = {};
        this.mountNode = document.getElementById('router-outlet');
        this.mountNode.classList.add('router-outlet_grey-bg');
        this.component = document.createElement('div');
        this.component.classList.add('slider');
        this.photos = [];
        this.player;
        this.animationProps;
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
            let animation = this.animationProps = calcAnimationProps(this.photos);

            this.photos.forEach((item) => {
                const img = document.createElement('div');
                img.style.backgroundImage = `url('${item.src}')`;
                fragment.appendChild(img);
            });
            let figure = document.createElement('figure');

            this.player = figure.animate(animation.keyframes, animation.options);
            figure.appendChild(fragment);
            figure.style.width = animation.containerWidth;

            this.createControls();

            return figure;
        };


        /**
         * Create properties of slider animation
         * @param photos
         * @returns {{keyframes: Array, options: {duration: number, iterations: Number}, containerWidth: string, imgWidth: number, slideDuration: number}}
         */
        function calcAnimationProps(photos) {

            let keyframes = [];
            let transform = 0;
            let transformStep = 100 / photos.length;
            let slideDuration = 2000;
            let duration = 0;
            let width = 0;

            photos.forEach((item) => {
                keyframes.push({transform: `translate(${transform}%)`});
                keyframes.push({transform: `translate(${transform}%)`});
                transform -= transformStep;
                duration += slideDuration;
                width += 100;
            });

            return {
                keyframes: keyframes,
                options: {duration: duration, iterations: Infinity},
                containerWidth: `${width}%`,
                imgWidth: transformStep,
                slideDuration: slideDuration
            }
        }
    }

    PhotosComponent.prototype.destroy = function () {
        this.mountNode.innerHTML = '';
        this.mountNode.classList.remove('router-outlet_grey-bg');
    };

    PhotosComponent.prototype.render = function () {
        this.component.appendChild(this.createSlider());
        this.mountNode.appendChild(this.component);
    };

    /**
     * Slider controls
     */
    PhotosComponent.prototype.createControls = function () {
        const fragment = document.createDocumentFragment();

        let controls = document.createElement('div');
        controls.classList.add('slider__slider-controls');

        let button = document.createElement('button');
        button.innerHTML = 'pause';
        button.addEventListener('click', () => {
            this.player.pause();
        });
        fragment.appendChild(button);

        let button2 = document.createElement('button');
        button2.innerHTML = 'play';
        button2.addEventListener('click', () => {
            this.player.play();
        });
        fragment.appendChild(button2);

        let button3 = document.createElement('button');
        button3.innerHTML = 'stop';
        button3.addEventListener('click', () => {
            this.player.cancel();
        });
        fragment.appendChild(button3);

        let btnPrev = document.createElement('button');
        btnPrev.innerHTML = 'Prev';
        btnPrev.classList.add('slider__btn');
        btnPrev.classList.add('slider__btn_prev');
        btnPrev.addEventListener('click', () => {
            this.player.pause();
            let slideNumber = Math.floor(this.player.currentTime.toFixed(0) / this.animationProps.slideDuration);
            if (slideNumber <= 0) {
                this.player.currentTime = this.animationProps.slideDuration/2;
            } else {
                this.player.currentTime = ((slideNumber - 1) * this.animationProps.slideDuration) + this.animationProps.slideDuration/2;
            }
        });
        fragment.appendChild(btnPrev);

        let btnNext = document.createElement('button');
        btnNext.innerHTML = 'Next';
        btnNext.classList.add('slider__btn');
        btnNext.classList.add('slider__btn_next');
        btnNext.addEventListener('click', () => {
            this.player.pause();
            let slideNumber = Math.floor(this.player.currentTime.toFixed(0) / this.animationProps.slideDuration);
            if (slideNumber < 0) {
                this.player.currentTime = this.animationProps.slideDuration/2;
            } else {
                this.player.currentTime = ((slideNumber + 1) * this.animationProps.slideDuration)+ this.animationProps.slideDuration/2;
            }
        });
        fragment.appendChild(btnNext);

        controls.appendChild(fragment);
        this.mountNode.appendChild(controls);
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
