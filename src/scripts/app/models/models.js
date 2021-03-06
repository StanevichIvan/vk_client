(function () {
    function User(item) {
        this.firstName = item.first_name || '';
        this.lastName = item.last_name || '';
        this.photo = item.photo_50 || '';
        this.lastSeen = item.last_seen || '';
        this.nickname = item.nickname || '';
        this.id = item.uid || 0;
    }

    function Dialog(item) {
        this.body = item.body || '';
        this.out = item.out || 0;
        this.user = item.user ? new User(item.user) : null;
        this.time = item.date ? window.app.helpers.timeOffsetFromNow(item.date) : '';
        this.fromID = item.from_id || '';
        this.img = '';

        if (item.attachment) {
            this.attach = item.attachment || null;
        }
    }

    function Attachment(item) {
        this.title = item.doc.title || '';
        this.url = item.doc.url || '';
    }

    function Chat(obj) {
        this.body = obj.body || '';
        this.out = obj.out || 0;
        this.title = obj.title || '';
        this.id = obj.chat_id;
        this.user = obj.user ? new User(obj.user) : null;
        this.time = obj.date ? window.app.helpers.timeOffsetFromNow(obj.date) : '';
    }

    function Photo(obj) {
        this.src = obj.src_big || '';
        this.height = obj.height || 0;
        this.width = obj.width || 0;
    }

    function Album(obj) {
        this.title = obj.title || '';
        this.id = obj.aid || '';
        this.thumb_id = obj.thumb_id || '';
        this.coverSrc = obj.thumb_src || '';
    }

    function News(obj) {

        this.type = obj.type || '';

        switch (obj.type) {
            case 'event':
                Event.call(this, obj);
                break;

            case 'post':
                Post.call(this, obj);
                break;

            case 'wall_photo':
                WallPhoto.call(this, obj);
                break;

            case 'video':
                Video.call(this, obj);
                break;
        }
    }

    function Event(obj) {
        this.img = obj.photo_medium || '';
        this.name = obj.name;
    }

    function Post(obj) {
        this.name = obj.text || '';
        this.photos = [];

        obj.attachments.forEach((item) => {
            if (item.type === 'photo') {
                this.photos.push(item.photo.src);
            }
        });
    }

    function WallPhoto(obj) {
        this.photos = [];

        obj.photos.forEach((item) => {
            if (typeof item === 'object')
                this.photos.push(item.src);
        });
    }

    function Video(obj) {
        this.videos = [];

        obj.video.forEach((item) => {
            if (typeof  item === 'object') {
                this.videos.push({image: item.image, title: item.title, id: item.vid, ownerID: item.owner_id});
            }
        });
    }

    function Document(obj) {
        this.ownerID = obj.owner_id || '';
        this.title = obj.title || '';
        this.url = obj.url || '';
        this.mediaID = obj.did || '';
    }

    if (!window.app)
        window.app = {};

    app.model = {};
    app.model.Dialog = Dialog;
    app.model.User = User;
    app.model.Video = Video;
    app.model.WallPhoto = WallPhoto;
    app.model.Post = Post;
    app.model.Event = Event;
    app.model.Album = Album;
    app.model.News = News;
    app.model.Photo = Photo;
    app.model.Chat = Chat;
    app.model.Document = Document;
})();