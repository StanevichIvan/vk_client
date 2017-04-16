(function () {
    // window.location = 'https://oauth.vk.com/authorize?client_id=5971236&redirect_uri=blank.html&scope=friends,messages,offline&response_type=token
    const token = '02beaab7f3ebd1c22ed84e7c259da239c4a73b9a9c15d6c11b3cb67a19fcf3078ce72c9870e93307d1a34';
    const baseURL = 'http://localhost:5000/';

    /**
     *
     * @returns {Promise}
     */
    const getDialogs = function () {
        let dialogs;

        return fetch(baseURL + 'method/messages.getDialogs?access_token=' + token, {method: 'GET'})
            .then(res=> res.json())
            .then(res => res.response)
            .then((json) => {
                let idList = json.map((item) => {
                    if (item.uid)
                        return item.uid;
                    return '';
                });
                dialogs = json;
                return getUsersProfiles(idList);
            })
            .then(res => res.json())
            .then((res) => {
                return mergeDialogsInfo(res.response, dialogs);
            });
    };

    /**
     * Merge data from two requests
     * @param userData {Array}
     * @param dialogs {Array}
     * @returns {Array}
     */
    var mergeDialogsInfo = function (userData, dialogs) {
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
     * Loads user data from vk server
     * @param listOfIds
     * @returns {Promise}
     */
    const getUsersProfiles = function (listOfIds) {
        return fetch(baseURL + 'method/users.get?access_token=' + token + "&fields=" + "photo_50" + "&user_ids=" + listOfIds, {method: 'GET'});
    };

    /**
     * Get messages from user
     * @returns {*}
     */
    const getMessages = function (uid) {
        return fetch(`${baseURL}method/messages.getHistory?access_token=${token}&count=200&time_offset=0&user_id=${uid}`, {method: 'GET'})
            .then((res) => res.json())
            .then((res) => res.response)
            .then((messagesList) => {
                return messagesList.map((item) => {
                    return new Dialog(item);
                });
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

    const getFriends = function () {
        return fetch(`${baseURL}method/friends.get?access_token=${token}&fields=photo_50,last_seen,nickname`, {method: 'GET'})
            .then(res => {
                return res.json();
            })
            .then(res => {
                return res.response.map((item)=> {
                    return new User(item);
                });
            });
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

    if(!window.app)
        window.app = {};

    app.xhrService = {
        getDialogs: getDialogs,
        getUsersProfiles: getUsersProfiles,
        getMessages: getMessages,
        sendMessage: sendMessage,
        getFriends: getFriends
    };
})();