(function () {
    const vkService = window.app.xhrService;

    function DocsSelect(props) {
        this.container = props.container;
        this.tokenCancel = {};
        this.selectDocument = props.selectDocument;
        this.userID = props.userID || 0;

        this.render();
    }

    DocsSelect.prototype.render = function () {

        vkService.getDocs(this.tokenCancel).then((res) => {
            this.container.appendChild(this.createList(res));
        });
    };

    DocsSelect.prototype.createList = function (documents) {
        let fragment = document.createDocumentFragment();

        documents.forEach((item) => {
            fragment.appendChild(this.createListItem(item));
        });

        return fragment;
    };

    DocsSelect.prototype.createListItem = function (doc) {
        let div = document.createElement('div');

        div.innerHTML = `<p class="docs-select__list-title">${doc.title}</p>`;

        div.addEventListener('click', () => {
            this.uploadDocument(doc);
        });
        div.addEventListener('click', () => {
            this.container.classList.remove('active');
        });

        return div;
    };

    DocsSelect.prototype.uploadDocument = function (doc) {
        vkService.sendDocMessage(this.tokenCancel, doc, this.userID);
    };

    app.docsComponent = DocsSelect;
})();