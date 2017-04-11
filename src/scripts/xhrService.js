var xhrService = (function () {

    const token = '4f8804bdb170b7d29d689420b2b379066bf79c843d1d6ea85ca0a5f417d0e3844ea2541e279f439bf4417';
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

    return {
        getDialogs : getDialogs,
        getUsersProfiles : getUsersProfiles,
        getMessages : getMessages
    };
})();