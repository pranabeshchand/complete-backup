/**
 * Created by aasheesh on 4/6/17.
 */
var request = require('request');
var config = require('./../config/config');
var co = require('co');

var tokenEndPoints = {
    SalesForce: "https://login.salesforce.com/services/oauth2/token",
    Box: "https://api.box.com/oauth2/token",
    GoogleDrive: "https://www.googleapis.com/oauth2/v4/token"
}

var oauth = {
    getNewAccessToken(OauthPlatform, refresh_token) {
        return co(function* () {
            try {
                var options = {
                    url: tokenEndPoints[OauthPlatform],
                    method: 'POST',
                    json: true,
                    form: {
                        grant_type: 'refresh_token',
                        client_id: config[OauthPlatform]['client_id'],
                        client_secret: config[OauthPlatform]['client_secret'],
                        refresh_token: refresh_token
                    }
                }
                request(options, function (err, response, body) {
                    if (err) {
                        console.log("err is " + err);
                        return err;
                    } else {
                        console.log("body is " + JSON.stringify(body.null, 2));
                        return body;
                    }
                })

            } catch(e) {
               console.log("exception in getNewAccessToken is " + e);
                return e;
            }
        })

    }
}


module.exports = oauth;
