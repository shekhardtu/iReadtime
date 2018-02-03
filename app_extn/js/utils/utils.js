var clpsck = {
    data: {

    },
    generalFunction: {
        // cookie functions start here
        addCookieMins: function(c_name, value, expMins) {

            // if(c_name == 'msp_login_email' && getCookie('msp_login') && getCookie('msp_login_email')){
            //     return;
            // }

            var expDate;
            var domain_name = ".clipsack.com";
            // var domain_name = ".mspsg.in";
            if (expMins) {
                expDate = new Date();
                expDate.setTime(expDate.getTime() + (expMins * 60 * 1000));
                expDate = expDate.toUTCString();
            }
            var c_value = escape(value) + ((!expDate) ? "" : "; expires=" + expDate) + ";domain=" + domain_name + " ; path=/";

            document.cookie = c_name + '=' + c_value + ';';

            if (expMins < 0) {
                c_value = escape(value) + "; expires=" + expDate + "; path=/";
                document.cookie = c_name + '=' + c_value + ';';
            }

            if (c_name == 'msp_login_email') {
                if (window.dataLayer) {
                    dataLayer.push({ 'event': 'email_success' });
                }
                log_data("pageView");
            }
        },

        addCookie: function(c_name, value, expDays) {
            addCookieMins(c_name, value, expDays * 24 * 60);
        },

        setCookie: function(c_name, value, recentexdays) {
            addCookie(c_name, value, recentexdays);
        },

        setCookieMins: function(c_name, value, expMins) {
            addCookieMins(c_name, value, expMins);
        },

        removeCookie: function(c_name) {
            addCookie(c_name, '', -1);
        },

        deleteCookie: function(c_name) {
            removeCookie(c_name);
        },

        getCookie: function(c_name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            var ret_val;
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    ret_val = unescape(y);
                }
            }
            return ret_val;
        },
        // cookie functions end here

        // localStorage functions start here
        isSupportLocalStorage: function() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        },
        getStorageData: function(type, dataRow) {
            var storageType = window[type + 'Storage'];
            if (!storageType.getItem(dataRow)) {
                return false;
            } else {
                return storageType.getItem(dataRow)
            }
        },
        setStorageData: function(type, dataRowName, dataToStore) {
            //dataRow should be in JSON format;
            var storageType = window[type + 'Storage'];

            storageType.setItem(dataRowName, dataToStore);
            return true;

        },
        removeStorageData: function(dataRowName) {

            localStorage.removeItem(dataRowName);
            return true;

        }

        // localStorage functions End here
    },
    eventFunction: {

    },
    ajaxFunction: {

    },
    init: function() {

    }

}
