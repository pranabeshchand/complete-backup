(function() {
    /**
     * Initialise a Google Driver file picker
     */
    var GoogleDriveApi = window.GoogleDriveApi = function(options) {debugger;
        // Config
        this.apiKey = options.apiKey;
        this.clientId = options.clientId;

        // Elements
        this.buttonEl = options.buttonEl;
        this.signOutEl = options.signOutEl;

        // Events
        this.onSelect = options.onSelect;
        if(this.buttonEl) {
            //this.buttonEl.addEventListener('click', this.open.bind(this));
            this.open.bind(this);
            this.open();

            // Disable the button until the API loads, as it won't work properly until then.
            /*this.buttonEl.disabled = true;*/
        }

        if(this.signOutEl) {
            this.close.bind(this);
            this.close();
        }

        // Load the drive API
        gapi.client.setApiKey(this.apiKey);
        gapi.client.load('drive', 'v2', this._driveApiLoaded.bind(this));
    }

    GoogleDriveApi.prototype = {
        /**
         * Open the file picker.
         */
        open: function() {
            // Check if the user has already authenticated
            var token = gapi.auth.getToken();
            if (token) {
                this._pickerCallback();
            } else {
                // The user has not yet authenticated with Google
                // We need to do the authentication before displaying the Drive picker.
                this._doAuth(false, function() { this._pickerCallback(); }.bind(this));
            }
        },

        close: function() {debugger;
            // Check if the user has already authenticated
            var token = gapi.auth.getToken();
            if (token) {
                gapi.auth.setToken(null);
                gapi.auth.signOut();
            }
            if (this.onSelect) {
                var signOut = "Sign Out";
                this.onSelect(signOut);
            }
        },

        /**
         * Called when a file has been selected in the Google Drive file picker.
         * @private
         */
        _pickerCallback: function() {
            var request = gapi.client.drive.files.list();

            request.execute(this._fileGetCallback.bind(this));
        },
        /**
         * Called when file details have been retrieved from Google Drive.
         * @private
         */
        _fileGetCallback: function(file) {
            if (this.onSelect) {
                var token = gapi.auth.getToken();
                this.onSelect(file,token);
            }
        },

        /**
         * Called when the Google Drive API has finished loading.
         * @private
         */
        _driveApiLoaded: function() {
            this._doAuth(true);
        },

        /**
         * Authenticate with Google Drive via the Google JavaScript API.
         * @private
         */
        _doAuth: function(immediate, callback) {
            gapi.auth.authorize({
                client_id: this.clientId + '.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/drive',
                immediate: immediate
            }, callback);
        }
    };
}());
