(function (ATT, $) {


    /**
     * Occurs once a page has unloaded (or the browser window has been closed).
     */
    window.onbeforeunload = function () {
        ATT.fn.logout();
    };

    //////////////////////////////////////////////////////
    /**
     * Entry point to WCG Media Services
     */
    function WCGCall(att, callee, hasVideo) {
        var self = this;

        WildEmitter.call(this);

        self.att = att;
        self.remotePeer = callee;
        //If user cancels the call right after having dialed the number, wait for the "RINGING" event.
        //If cancelling the call is done before the RINGING event, it would throw an exception because the WCGapi.js is
        //looking for a call session that doesn't exist.
        self.earlyHangup = false;

        var media = (hasVideo) ? {
            audio: true,
            video: true
        } : {
            audio: true,
            video: false
        };
        console.log("WCGCall create call");
        //init the Media Services here
        self._call = att.wcgBackend.wcgService.createCall(callee, media);
        //call
        self._call.ring();

        self._bind();

        self.on('*', function (eventType) {
            att.emit(eventType, self);
        });

        return self;
    }

    /**
     * Create an instance of WCGCall that inherits from a WildEmitter class
     */
    WCGCall.prototype = Object.create(WildEmitter.prototype, {
        constructor: {
            value: WCGCall
        }
    });

    /**
     * Bind events to the call and propagate them through att emitter
     */
    WCGCall.prototype._bind = function () {
        var self = this;

        this._call.onaddstream = function (event) {
            if (event.call.mediaType.video && event.call.mediaType.video == true) {
                if (event.call.localStreams) {
                    self.att.emit('localVideo', event.call.localStreams[0]);
                }
                if (event.call.remoteStreams) {
                    self.att.emit('remoteVideo', event.stream);
                }
            }

        };
        this._call.onbegin = function (event) {
            console.log("onbegin", event);
            self.emit('callBegin')
        };
        this._call.onend = function (event) {
            console.log("onend", event);
            self.emit('callEnd');
        };
        this._call.onerror = function (event) {
            console.log("onerror", event);
            self.emit('callError');
        };
        this._call.onstatechange = function (event) {
            console.log("onstatechange", event);
            if (event.state == Call.State.RINGING) {
                if (self.earlyHangup == true) {
                    //if user cancels the call before accepting/denying the controls
                    //wait until the call has actually reached the server ("RINGING")
                    self.earlyHangup = false;
                    self._call.end();
                }
                self.emit('ring');
            }
            self.emit('wcgstateChange');
        };

    }
    /**
     * Answer to the call
     */
    WCGCall.prototype.answer = function () {
        this._call.answer();
    }
    /**
     * End the call
     */
    WCGCall.prototype.hangup = function () {
        var self = this;

        if (this._call && this._call != null) {
            if ((this._call.state == Call.State.RINGING) || (this._call.state == Call.State.ONGOING) || (this._call.state == Call.State.HOLDING) || (this._call.state == Call.State.WAITING)) {
                this._call.end();
            }
            else {
                //if user cancels the call before accepting the controls
                //wait until the call has actually reached the server ("RINGING")
                self.earlyHangup = true;
            }

        }

    }
    //////////////////////////////////////////////////////
    ATT.fn.WCGCall = function (att, call) {
        var self = this;
        var wcgCall = Object.create(WCGCall.prototype);
        wcgCall.att = att;

        WildEmitter.call(wcgCall);

        //call
        wcgCall._call = call;
        wcgCall.remotePeer = call.recipient

        wcgCall._bind();

        wcgCall.on('*', function (eventType) {
            wcgCall.att.emit(eventType, wcgCall);
        });

        return wcgCall;
    };
    /**
     * Logout from WCG
     */
    ATT.fn.logout = function () {
        if (this.wcgBackend.wcgService) {
            console.log("Logging out");
            this.wcgBackend.wcgService.unregister();
            this.wcgBackend.wcgService = null;
        }
    };



    ATT.fn.wcgBackend = {
        wcgService: null
    };

    //////////////////////////////////////////////////////

    ATT.fn.dial = function (number, video) {
        var self = this;

        var sipOccurence = number.match(/sip\:([^@]*)@/);
        var sipuser = null;

        if (sipOccurence) {
            //it's a sip address
            sipuser = number;
        } else {

            //otherwise parse the number
            var userid = number;
            number = ATT.phoneNumber.parse(number);
            number = ATT.phoneNumber.getCallable(number);
            //by default we are using the webims server
            sipuser = "sip:" + number + "@webims.tfoundry.com";

            if (att.config.server == 'alpha1') {
                //sipuser = "sip:" + number + "@vims1.com";
                sipuser = userid;
            }
            else if (att.config.server == 'iip') {
                sipuser = userid;
            }
            else if (att.config.server == 'webims') {
                sipuser = "sip:" + number + "@webims.tfoundry.com";
            }
        }

        var call;
        //make a call (audio or video)
        if (!video) {
            call = new WCGCall(self, sipuser, false);
        }
        else {
            call = new WCGCall(self, sipuser, true);
        }



        self.emit('calling', number);
        self.emit('outgoingCall', call);

    }



    ATT.initPlugin(function (att) {
        console.log('Load WCG Plugin');

        var self = this;
        self.att = att;

        att.on('user', function (user) {
            console.log('Setting up WCG');

            //set the default WCG values: using by default webims server
            var wcgUrl = 'http://wcg-dia.tfoundry.com:38080/HaikuServlet/rest/v2/';
            var turn = 'STUN:stun.l.google.com:19302';

            var accessToken = att.config.apiKey;


            sipuser = "sip:" + user.first_name + "@webims.tfoundry.com";
            sipuser = sipuser.toLowerCase();

            var stringToMatch = sipuser.match(/sip\:([^@]*)@/);
            var string = stringToMatch ? stringToMatch[1] : null;

            var password = string;

            if (att.config.server == 'alpha1') {
                wcgUrl = 'http://64.124.154.203:38080/HaikuServlet/rest/v2/';
                turn = 'STUN:64.125.154.203:3478';
                sipuser = user.first_name;
                password = 'oauth' + accessToken;
            }
            else if (att.config.server == 'iip') {
                wcgUrl = 'http://206.19.204.53:8080/HaikuServlet/rest/v2/';
                turn = 'STUN:206.18.171.164:5060';
                var accessToken = "";
                sipuser = string;

                data = {
                    //access_token: self.config.apiKey
                    external_id : sipuser,
                    virtual_tn : ''
                };
                $.ajax({
                    data : data,
                    url : 'http://whtg.iipdev.com:80/Simulated/Generate/AccessToken',
                    headers : {
                        'Cache-Control' : 'no-cache',
                        'Pragma' : 'no-cache'
                    },
                    success : function(token) {
                        console.log("TOKEN", token);
                        accessToken = token;
                        password = 'oauth' + token;
                        //do something here
                        att.wcgBackend.wcgService = new MediaServices(wcgUrl, sipuser, password, "audio,video,chat");
                        att.wcgBackend.wcgService.turnConfig = turn;

                        att.wcgBackend.wcgService.onready = function () {

                            att.emit('phoneReady');
                        }
                        att.wcgBackend.wcgService.onclose = function () {
                            att.emit('phoneClose');
                        }
                        att.wcgBackend.wcgService.onerror = function (event) {
                            att.emit('phoneError', event.reason);
                        }
                        att.wcgBackend.wcgService.oninvite = function (event) {
                            if (event.call) {
                                var call = event.call;
                                console.log("call media", call.mediaType);

                                //instantiage the WCGCall (incoming call)
                                var wcgCall = new ATT.fn.WCGCall(att, call);
                                att.emit('incomingCall', wcgCall, wcgCall.remotePeer);
                            }
                        }

                        return;

                    }

            });
            }
            else if (att.config.server == 'webims') {
                wcgUrl = 'http://wcg-dia.tfoundry.com:38080/HaikuServlet/rest/v2/';
                turn = 'STUN:206.18.171.164:5060';
                sipuser = "sip:" + user.first_name + "@webims.tfoundry.com";
                sipuser = sipuser.toLowerCase();

                var stringToMatch = sipuser.match(/sip\:([^@]*)@/);
                var string = stringToMatch ? stringToMatch[1] : null;

                password = string;

            }


            att.wcgBackend.wcgService = new MediaServices(wcgUrl, sipuser, password, "audio,video,chat");
            att.wcgBackend.wcgService.turnConfig = turn;

            att.wcgBackend.wcgService.onready = function () {

                att.emit('phoneReady');
            }
            att.wcgBackend.wcgService.onclose = function () {
                att.emit('phoneClose');
            }
            att.wcgBackend.wcgService.onerror = function (event) {
                att.emit('phoneError', event.reason);
            }
            att.wcgBackend.wcgService.oninvite = function (event) {
                if (event.call) {
                    var call = event.call;
                    console.log("call media", call.mediaType);

                    //instantiage the WCGCall (incoming call)
                    var wcgCall = new ATT.fn.WCGCall(att, call);
                    att.emit('incomingCall', wcgCall, wcgCall.remotePeer);
                }
            }



        });
    });

})(ATT, jQuery);