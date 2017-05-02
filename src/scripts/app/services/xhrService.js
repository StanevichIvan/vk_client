(function () {
    // window.location = 'https://oauth.vk.com/authorize?client_id=5971236&redirect_uri=blank.html&scope=friends,messages,wall,video,docs,photos&response_type=token'
    const TOKEN = '';
    const BASE_URL = 'http://localhost:5000/';
    const userId = '145772800';
    window.localStorage.setItem('currentUser',  JSON.stringify({id : userId}));

    let longPollCredentials = {
        server: '',
        key: '',
        ts: ''
    };

    let Dialog = app.model.Dialog,
        User = app.model.User,
        Video = app.model.Video,
        WallPhoto = app.model.WallPhoto,
        Post = app.model.Post,
        Event = app.model.Event,
        Album = app.model.Album,
        News = app.model.News,
        Photo = app.model.Photo,
        Document = app.model.Document,
        Chat = app.model.Chat;

    let longPollCreated = false;

    /**
     *
     * @returns {Promise}
     */
    const getDialogs = function (tokenCancel) {
        let dialogs;

        let xhr = new XMLHttpRequest();
        xhr.open("GET", BASE_URL + 'method/messages.getDialogs?access_token=' + TOKEN);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                let idList = json.map((item) => {
                    if (item.uid)
                        return item.uid;
                    return '';
                });
                dialogs = json;

                resolve(getUsersProfiles(tokenCancel, idList));
            };

            tokenCancel.cancel = function () {  // SPECIFY CANCELLATION
                xhr.abort(); // abort request
                reject(new Error("Cancelled")); // reject the promise
            };
            xhr.onerror = reject;
            xhr.send();
        })
            .then((res) => {
                return mergeDialogsInfo(res, dialogs);
            });
    };

    const createMultiuserChat = function (tokenCancel, ids) {

        let listOfIds = ids.toString();

        let xhr = new XMLHttpRequest();
        xhr.open("GET", BASE_URL + 'method/messages.createChat?access_token=' + TOKEN + "&user_ids=" + listOfIds);
        //
        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    };

    /**
     * Helper
     * Merge data from two requests
     * @param userData {Array}
     * @param dialogs {Array}
     * @returns {Array}
     */
    const mergeDialogsInfo = function (userData, dialogs) {
        let diaolgsBundle = [];

        dialogs.forEach((item) => {
            if (typeof item === 'object') {
                userData.forEach((user) => {
                    if (item.uid === user.uid) {
                        let resObj = Object.assign({}, item);
                        resObj.user = user;

                        if (resObj.hasOwnProperty('chat_id')) {
                            diaolgsBundle.push(new Chat(resObj));
                        } else {
                            diaolgsBundle.push(new Dialog(resObj));
                        }
                    }
                });
            }
        });
        return diaolgsBundle;
    };

    /**
     * @param tokenCancel
     * @param mesages ids
     * @returns {Promise}
     */
    const getMessageById = function (tokenCancel, ids) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}method/messages.getById?access_token=${TOKEN}&message_ids=${ids}`);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    };


    /**
     * Get messages from user
     * @returns {*}
     */
    const getMessages = function (tokenCancel, uid) {

        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}method/messages.getHistory?access_token=${TOKEN}&count=200&time_offset=0&user_id=${uid}`);

        let messages;

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                messages = json.map(item => new Dialog(item));
                resolve(messages);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();

        }).then((res) => {
            // get images by id
            let listIds = [];
            res.forEach((item) => {
                if (!(listIds.includes(item.fromID)) && item.fromID !== '') {
                    listIds.push(item.fromID);
                }
            });

            return getUsersProfiles({}, listIds.toString());
        }).then((res) => {
            // create dictionary for {id, src}[]
            let avatarDictionary = {};
            res.forEach((item) => {
                avatarDictionary[item.uid] = item.photo_50;
            });

            // modify messages
            messages.forEach((item) => {
                item.img = avatarDictionary[item.fromID];
            });

            return messages;
        });
    };

    /**
     * Get chat messages
     * @returns {*}
     */
    const getChatMessages = function (tokenCancel, id) {

        let xhr = new XMLHttpRequest();
        const chatID = +2000000000 + +id;
        xhr.open("GET", `${BASE_URL}method/messages.getHistory?access_token=${TOKEN}&peer_id=${chatID}&count=200&v=5.38`);

        let messages;

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                messages = json.items.map(item => new Dialog(item));
                resolve(messages);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        }).then((res) => {
            // get images by id
            let listIds = [];
            res.forEach((item) => {
                if (!(listIds.includes(item.fromID)) && item.fromID !== '') {
                    listIds.push(item.fromID);
                }
            });

            return getUsersProfiles({}, listIds.toString());
        }).then((res) => {
            // create dictionary for {id, src}[]
            let avatarDictionary = {};
            res.forEach((item) => {
                avatarDictionary[item.uid] = item.photo_50;
            });

            // modify messages
            messages.forEach((item) => {
                item.img = avatarDictionary[item.fromID];
            });

            return messages;
        });
    };

    /**
     * Loads data users profiles
     * @param tokenCancel
     * @param listOfIds
     * @returns {Promise}
     */
    const getUsersProfiles = function (tokenCancel, listOfIds) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", BASE_URL + 'method/users.get?access_token=' + TOKEN + "&fields=" + "photo_50" + "&user_ids=" + listOfIds);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    };

    const sendChatMessage = function (tokenCancel, id, message) {

        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}method/messages.send?access_token=${TOKEN}&chat_id=${id}&message=${message}`);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    };

    /**
     * Send message to user with id
     * @param uid
     * @param message
     * @returns {*}
     */
    function sendMessage(uid, message) {
        return fetch(`${BASE_URL}method/messages.send?access_token=${TOKEN}&user_id=${uid}&message=${message}`, {method: 'POST'});
    }

    const getFriends = function (tokenCancel) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}method/friends.get?access_token=${TOKEN}&fields=photo_50,last_seen,nickname`);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.map(item => new User(item)));
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    };

    const searchFriends = function (tokenCancel, name) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/friends.search?access_token=${TOKEN}&q=${name}&fields=photo_50,last_seen,nickname`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;

                resolve(json.map(item => {
                    if (typeof  item === 'object')
                        return new User(item);
                    return '';
                }));
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    const getPhotos = function (tokenCancel, uid) {
        let id = uid;
        if (!id)
            id = userId;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/photos.get?access_token=${TOKEN}&owner_id=${id}&album_id=wall`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;

                resolve(json.map(item => new Photo(item)));
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    /**
     *
     * @param tokenCancel
     * @param uid
     * @returns {Promise}
     */
    const getAlbums = function (tokenCancel, uid) {
        let id = uid;

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/photos.getAlbums?access_token=${TOKEN}&owner_id=${id}&need_covers=1`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.map(item => new Album(item)));
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    /**
     * Load album photos
     * @param tokenCancel
     * @param uid
     * @param albumId
     * @returns {Promise}
     */
    const getAlbumPhotos = function (tokenCancel, uid, albumId) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/photos.get?access_token=${TOKEN}&owner_id=${uid}&album_id=${albumId}`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.map(item => new Photo(item)));
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    const getNews = function (tokenCancel) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/newsfeed.get?access_token=${TOKEN}`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.items.map((item) => {
                    return new News(item);
                }));
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    const getVideo = function (tokenCancel, id, ownerID) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/video.get?access_token=${TOKEN}&videos=${id}&owner_id=${ownerID}`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    const longPoll = function () {

        if (longPollCreated) return;

        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${BASE_URL}method/messages.getLongPollServer?access_token=${TOKEN}`, true);
        xhr.send();
        xhr.addEventListener("load", function () {
            if (this.status === 200) {
                longPollCredentials = JSON.parse(this.responseText).response;
                let xhr = new XMLHttpRequest();
                xhr.open("GET", `https://${longPollCredentials.server}?act=a_check&key=${longPollCredentials.key}&ts=${longPollCredentials.ts}&wait=25&mode=2&version=1`, true);
                xhr.send();
                xhr.addEventListener('load', function () {
                    console.log(this);
                });

                subscribe(`${BASE_URL}nim0800?act=a_check&key=${longPollCredentials.key}&ts=${longPollCredentials.ts}&wait=25&mode=2&version=1`);
            }
        });

        function subscribe(url) {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState !== 4) return;

                if (this.status === 200) {
                    let respData = JSON.parse(this.responseText);
                    longPollCredentials.ts = respData.ts; // update timestamp

                    if (respData.updates) {
                        if (respData.updates.length !== 0) {

                            let messages = [];
                            // grab only new messages

                            respData.updates.forEach((item) => {
                                if (item[0] === 4) {
                                    messages.push(item);
                                }
                            });
                            window.app.messagesObserver.fire(messages);
                        }
                    }
                } else {
                }
                // new subscription with updated timestamp
                subscribe(`${BASE_URL}nim0800?act=a_check&key=${longPollCredentials.key}&ts=${longPollCredentials.ts}&wait=25&mode=2&version=1`);
            };
            xhr.open("GET", url, true);
            xhr.send();
            longPollCreated = true;
        }
    };

    const messagesPhotoUploadServer = function (tokenCancel) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/photos.getMessagesUploadServer?access_token=${TOKEN}`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.upload_url);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    const messagesPhotoUpload = function (tokenCancel, url, photo) {
        let xhr = new XMLHttpRequest();
        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            let file = photo.files[0];
            let formData = new FormData();
            formData.append("file", file);

            xhr.open('POST', BASE_URL + url, true);
            xhr.setRequestHeader('Content-Type', 'multipart/form-data;');
            xhr.send(formData);

        });
    };

    const getDocs = function (tokenCancel) {

        let xhr = new XMLHttpRequest();

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                let arr = [];

                json.forEach((item) => {
                    if (typeof item === 'object') {
                        arr.push(new Document(item));
                    }
                });

                resolve(arr);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.open('GET', `${BASE_URL}method/docs.get?access_token=${TOKEN}`, true);
            xhr.send();
        });
    };

    const sendDocMessage = function (tokenCancel, doc, id) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${BASE_URL}method/messages.send?access_token=${TOKEN}&user_id=${id}&attachment=doc${doc.ownerID}_${doc.mediaID}`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;

                resolve(json);
            };

            tokenCancel.cancel = function () {
                xhr.abort();
                reject(new Error('Cancelled'));
            };

            xhr.onerror = reject;
            xhr.send();
        });
    };

    app.xhrService = {
        getDialogs: getDialogs,
        getUsersProfiles: getUsersProfiles,
        getMessages: getMessages,
        sendMessage: sendMessage,
        getFriends: getFriends,
        longPoll: longPoll,
        searchFriends: searchFriends,
        getPhotos: getPhotos,
        getAlbums: getAlbums,
        getAlbumPhotos: getAlbumPhotos,
        getNews: getNews,
        getVideo: getVideo,
        createMultiuserChat: createMultiuserChat,
        getChatMessages: getChatMessages,
        messagesPhotoUploadServer: messagesPhotoUploadServer,
        messagesPhotoUpload: messagesPhotoUpload,
        getDocs: getDocs,
        sendDocMessage: sendDocMessage,
        sendChatMessage: sendChatMessage,
        getMessageById: getMessageById
    };
})();