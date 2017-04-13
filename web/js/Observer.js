(function() {
    function Observer() {
        this.handlers = [];  // observers
    }

    Observer.prototype.subscribe = function (fn) {
        this.handlers.push(fn);
    };

    Observer.prototype.unsubscribe = function (fn) {
        this.handlers = this.handlers.filter(
            function (item) {
                if (item !== fn) {
                    return item;
                }
            }
        );
    };

    Observer.prototype.fire = function (o, thisObj) {
        var scope = thisObj || window;
        this.handlers.forEach(function (item) {
            item.call(scope, o);
        });
    };

    window.app.messagesObserver = new Observer();
    window.app.menuObserver = new Observer();
})();

