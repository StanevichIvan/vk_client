var xhrService = (function () {
    // window.location = 'https://oauth.vk.com/authorize?client_id=5971236&redirect_uri=blank.html&scope=friends,messages,offline&response_type=token
    const token = 'f2832af6f5434e4d2dc99cb7a7e4c9e878a4d3595e50b4edf5eb10a3eff0626851d1aa6b7ef2e17dd6678';
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

    return {
        getDialogs: getDialogs,
        getUsersProfiles: getUsersProfiles,
        getMessages: getMessages,
        sendMessage: sendMessage,
        getFriends: getFriends
    };
})();