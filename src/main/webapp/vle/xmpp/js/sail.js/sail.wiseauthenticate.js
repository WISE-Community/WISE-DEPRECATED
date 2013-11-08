// uses jquery.url.js --> https://github.com/allmarkedup/jQuery-URL-Parser

var Sail = window.Sail || {}

Sail.WiseXMPPAuthenticate = {

}

Sail.WiseXMPPAuthenticate.Client = function(url) {
    this.url = url
}

Sail.WiseXMPPAuthenticate.Client.prototype = {
    /**
     * Get the current authentication token (from the current URL, i.e. from "?token=123xyz")
     *
     * In the future we may also wan to check for a 'token' cookie.
     */
    getCurrentToken: function() {
        // $.url is from jquery.url.js and refers to the current url 
        // (i.e. the url of the page we are currently on)
        return $.url.param('token')
    },
     
    /**
     * Redirect the user to the WiseXMPPAuthenticate login page for authentication.
     */
    redirectToLogin: function() {        
        window.location.replace(this.url+'/login?destination='+escape(window.location.href))
    },


    /**
     * Fetch session data for the given token.
     * If the session data is retrieved successfully, then given
     * callback is executed with the session data.
     *
     * The appropriate method for doign the request (JSON vs JSONP)
     * will be automatically determined by comparing the WiseXMPPAuthenticate
     * service URL to the current page's URL.
     */
    fetchSessionForToken: function(token, callback) {
        currentUrl = $.url.attr('source')
    
        $.url.setUrl(this.url)
        wiseXMPPAuthenticateHost = $.url.attr('host')
        wiseXMPPAuthenticatePort = $.url.attr('port')
        wiseXMPPAuthenticateProtocol = $.url.attr('protocol')
        $.url.setUrl(currentUrl)
    
        // determine whether we can talk to wiseXMPPAuthenticate over REST
        // or whetehr we have to use JSONP
        if (wiseXMPPAuthenticateHost == $.url.attr('host') 
                && wiseXMPPAuthenticatePort == $.url.attr('port')
                && wiseXMPPAuthenticateProtocol == $.url.attr('protocol')) {
            this.fetchSessionForTokenUsingREST(token, callback)
        } else {
            this.fetchSessionForTokenUsingJSONP(token, callback)
        }
    },
    
    fetchSessionForTokenUsingREST: function(token, callback) {
        var wiseXMPPAuthenticate = this;
        return $.ajax({
            url: wiseXMPPAuthenticate.url + '/sessions/validate_token.json',
            dataType: 'json',
            data: {
                token: token
            },
            success: callback,
            failure: function(error) {
                console.log(error)
                throw "Error response from WiseXMPPAuthenticate at " + wiseXMPPAuthenticate.url
            }
        })
    },
    
    fetchSessionForTokenUsingJSONP: function(token, callback) {
        var wiseXMPPAuthenticate = this;
        return $.ajax({
            url: wiseXMPPAuthenticate.url + '/sessions/validate_token.json',
            dataType: 'jsonp',
            data: {
                _method: 'GET',
                token: token
            },
            success: function(data) {
                if (data.error) {
                    console.log(data)
                    throw data.error.data + " (from " + wiseXMPPAuthenticate.url + ")"
                } else {
                    callback(data)
                }
            }
        })
    },
    
    fetchXMPPAuthentication: function(callback) {
    	var wiseXMPPAuthenticate = this;
    	return $.ajax({
    		url: wiseXMPPAuthenticate.url,
    		dataType: 'json',
    		success: callback,
    		failure: function(data) {
    			console.log("Failed to Authenticate with XMPP");
    		}
    	});
    }
}

//used to notify scriptloader that this script has finished loading
if(typeof eventManager != 'undefined'){
	eventManager.fire('scriptLoaded', 'vle/xmpp/js/sail.js/sail.wiseauthenticate.js');
}