(function () {
    // window.location = 'https://oauth.vk.com/authorize?client_id=5971236&redirect_uri=blank.html&scope=friends,messages,offline&response_type=token'
    const token = '685cdf596788aa39c8372e6acd23eea866b3a75e11b0e432e00b16f47f5b3f2767770104d1a1609e06a67';
    const baseURL = 'http://localhost:5000/';
    let longPollCredentials = {
        server: '',
        key: '',
        ts: ''
    };

    let longPollCreated = false;

    /**
     *
     * @returns {Promise}
     */
    const getDialogs = function (tokenCancel) {
        let dialogs;

        let xhr = new XMLHttpRequest;
        xhr.open("GET", baseURL + 'method/messages.getDialogs?access_token=' + token);

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
                        resObj['user'] = user;
                        diaolgsBundle.push(new Dialog(resObj));
                    }
                });
            }
        });
        return diaolgsBundle;
    };

    /**
     * Loads data users profiles
     * @param tokenCancel
     * @param listOfIds
     * @returns {Promise}
     */
    const getUsersProfiles = function (tokenCancel, listOfIds) {
        let xhr = new XMLHttpRequest;
        xhr.open("GET", baseURL + 'method/users.get?access_token=' + token + "&fields=" + "photo_50" + "&user_ids=" + listOfIds);

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

        let xhr = new XMLHttpRequest;
        xhr.open("GET", `${baseURL}method/messages.getHistory?access_token=${token}&count=200&time_offset=0&user_id=${uid}`);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.map(item => new Dialog(item)));
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
        return fetch(`${baseURL}method/messages.send?access_token=${token}&user_id=${uid}&message=${message}`, {method: 'POST'});
    }

    const getFriends = function (tokenCancel) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", `${baseURL}method/friends.get?access_token=${token}&fields=photo_50,last_seen,nickname`);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;
                resolve(json.map(item => new User(item)));
            };

            tokenCancel['cancel'] = function () {
                xhr.abort();
                reject(new Error("Cancelled"));
            };
            xhr.onerror = reject;
            xhr.send();
        });
    };

    const searchFriends = function (tokenCancel, name) {

        let xhr = new XMLHttpRequest();
        xhr.open('GET', `${baseURL}method/friends.search?access_token=${token}&q=${name}&fields=photo_50,last_seen,nickname`, true);

        return new Promise(function (resolve, reject) {
            xhr.onload = function () {
                let json = JSON.parse(xhr.responseText).response;

                resolve(json.map(item => {
                    if (typeof  item === 'object')
                        return new User(item);
                    return '';
                }));
            };

            tokenCancel['cancel'] = function () {
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
        xhr.open("GET", `${baseURL}method/messages.getLongPollServer?access_token=${token}`, true);
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

                subscribe(`${baseURL}nim0800?act=a_check&key=${longPollCredentials.key}&ts=${longPollCredentials.ts}&wait=25&mode=2&version=1`);
            }
        });

        function subscribe(url) {
            var xhr = new XMLHttpRequest();
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
                subscribe(`${baseURL}nim0800?act=a_check&key=${longPollCredentials.key}&ts=${longPollCredentials.ts}&wait=25&mode=2&version=1`);
            };
            xhr.open("GET", url, true);
            xhr.send();
            longPollCreated = true;
        }
    };

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
    }

    if (!window.app)
        window.app = {};

    app.model = {};
    app.model.Dialog = Dialog;
    app.model.User = User;

    app.xhrService = {
        getDialogs: getDialogs,
        getUsersProfiles: getUsersProfiles,
        getMessages: getMessages,
        sendMessage: sendMessage,
        getFriends: getFriends,
        longPoll: longPoll,
        searchFriends: searchFriends
    };
})();