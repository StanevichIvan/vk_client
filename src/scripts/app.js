'use strict';


var app = (function () {

    // Instance stores a reference to the Singleton
    var instance;

    function init() {

        const router = new window.router();
        const navbar = new window.navbarComponent(router);

        return {
            router : router
        };
    }

    return {
        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };

})();

// function authorize(response) {
//     if (response.session) {
//         // showFriends();
//     }
//     else {
//         alert("Please, enter correct credentials");
//     }
// }
// function showFriends() {
//     VK.Api.call('friends.get', {fields: 'uid,first_name, photo_50,last_seen'}, function (data) {
//         if (data.error) {
//             alert(data.error.error_msg);
//         } else {
//             if (data.response.length > 0) {
//                 document.getElementById('messages-container').appendChild(createListFragment(data, createFriend));
//             }
//         }
//     });
// }
//
// /**
//  * Create DOM element
//  * @param name {String}
//  * @param img {String}
//  * @returns {Element}
//  */
// function createFriend(name, img) {
//
//     let div = document.createElement('div');
//     div.className += "conversation__message new";
//     div.innerHTML = `<img class="conversation__avatar" src="${img}">
//                             <div class="conversation__message-info">
//                                 <h4 class="conversation__name">${name}</h4>
//                                 <p class="conversation__message-text">Of course!</p>
//                             </div>
//                             <div class="conversation__message-info">
//                                 <h4 class="conversation__name conversation__name_right">
//                                     <span class="conversation__message-count">169</span>
//                                     <span class="conversation__message-time">1 min</span>
//                                 </h4>
//                                 <p class="conversation__message-text conversation__name_right"><i
//                                         class="conversation__attachment"></i></p>
//                             </div>`;
//     return div;
// }
//
// VK.init({
//     apiId: 5971236
// });
// VK.Auth.login(authorize);
// window.location = 'https://oauth.vk.com/authorize?client_id=5971236&redirect_uri=blank.html&scope=friends,messages,offline&response_type=token