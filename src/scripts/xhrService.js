(function () {
    // window.location = 'https://oauth.vk.com/authorize?client_id=5971236&redirect_uri=blank.html&scope=friends,messages,offline&response_type=token
    const token = 'faa3cae8aa242f715ba9bd7fcecb30fa5891ae823abfcd50e71ae74bd84663cce04f97fd44e15c90919c1';
    const baseURL = 'http://localhost:5000/';

    /**
     *
     * @returns {Promise}
     */
    const getDialogs = function () {
        return fetch(baseURL + 'method/messages.getDialogs?access_token=' + token, {method: 'GET'});
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
        return fetch(`${baseURL}method/messages.getHistory?access_token=${token}&count=200&time_offset=0&user_id=${uid}`, {method: 'GET'});
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

    const getFriends = function(){
        return fetch(`${baseURL}method/friends.get?access_token=${token}&fields=photo_50,last_seen,nickname`, {method: 'GET'})
            .then(res => res.json());
    };

    window.app = {};
    app.xhrService = {
        getDialogs: getDialogs,
        getUsersProfiles: getUsersProfiles,
        getMessages: getMessages,
        sendMessage: sendMessage,
        getFriends: getFriends
    };
})();