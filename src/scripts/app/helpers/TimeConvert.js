(function () {

    /**
     * Convert unix time
     * @param unixTime
     * @returns {string} offset
     * @constructor
     */
    function timeOffsetFromNow(unixTime) {
        let timeOffset = Date.now() - (unixTime * 1000);
        let minutesOffset = (timeOffset / (1000 * 60)).toFixed(0);

        let stringOffset = '';

        if (minutesOffset > 60*24) {
            return (minutesOffset/(60*24)).toFixed(0) + ' d';
        }
        if (minutesOffset > 60) {
            return (minutesOffset/(60)).toFixed(0) + ' h';
        }

        return minutesOffset + ' min';
    }

    window.app.helpers = {
        timeOffsetFromNow: timeOffsetFromNow
    };
})();
