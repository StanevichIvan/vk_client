(function () {

    const vkService = window.app.xhrService;

    function PhotosComponent(id) {
        this.activeRequest = {};
        this.mountNode = document.getElementById('messages-container');
        this.component = document.createElement('div');
        this.component.classList.add('slider');
        this.photos = [];
        this.animation;

        this.loadPhotos = (id) => {
            vkService.getPhotos(this.activeRequest, id)
                .then((res) => {
                    this.photos = res;
                    this.render(this.photos);
                });
        };

        this.loadPhotos();

        this.createSlider = () => {
            let fragment = document.createDocumentFragment();
            let animation = calcAnimationProps(this.photos);

            this.photos.forEach((item) => {
                // const img = document.createElement('img');
                // img.src = item.src;
                // fragment.appendChild(img);
                //
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

        this.render = () => {
            this.component.appendChild(this.createSlider());
            this.mountNode.appendChild(this.component);
        };

        this.destroy = () => {
            this.mountNode.removeChild(this.component);
            this.mountNode.innerHTML = '';
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

    app.photosComponent = PhotosComponent;
})();
