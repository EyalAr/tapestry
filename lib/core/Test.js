(function(undefined){ 'use strict';

var TEST_STAGE_IDLE = 0,
    TEST_STAGE_SETUP = 1,
    TEST_STAGE_RUNNING = 2,
    TEST_STAGE_TEARDOWN = 3,
    TEST_STAGE_FINISHED = 4,
    TEST_STAGE_SKIPPED = 5,
    TEST_STAGE_KILLED = 6,
    TEST_STAGE_UNKNOWN = 7;

var async = require('async'),
    GlobalCatcher = require('./GlobalCatcher'),
    Modifier = require('./Modifier'),
    Referee = require('./Referee'),
    forceAsync = async.nextTick;

function Test(meta, fn, parent){
    this.meta = meta;
    this.parent = parent;
    this.async = fn.length > 0;
    this.stage = TEST_STAGE_IDLE;
    this.success = undefined;
    this.setupSuccess = undefined;
    this.teardownSuccess = undefined;
    this.killed = false;
    this.msg = undefined;
    this.time = undefined;
    this.timeout = 0;
    this.timedout = false;
    this.context = {};
    this.modifier = new Modifier(this);
    this.fn = fn.bind(this.context);
}

Test.prototype.is = function(what){
    return this[what] || this.parent.is(what);
};

Test.prototype.run = function(done){
    var self = this,
        time = Date.now();
    if (self.is('skip')){
        self.time = Date.now() - time;
        self.stage = TEST_STAGE_SKIPPED;
        return done();
    }

    async.series([

        // 1. setup
        function(done){
            self.stage = TEST_STAGE_SETUP;

            async.eachSeries(self.setup || [], function(setupFn, _done){
                function done(){
                    GlobalCatcher.unsubscribe(done);
                    _done.apply(null, arguments);
                }
                GlobalCatcher.subscribe(done);

                forceAsync(function(){
                    // async / sync setup?
                    if (setupFn.length > 0) setupFn(done);
                    else {
                        setupFn();
                        done();
                    }
                });
            }, function(err){
                if (err){
                    self.setupSuccess = false;
                    self.msg = err.toString();
                    self.stage = TEST_STAGE_UNKNOWN;
                    return done("setup");
                }
                self.setupSuccess = true;
                done();
            });
        },

        // 2. run
        function(_done){
            function catcher(e){
                self.time = Date.now() - time;
                self.stage = TEST_STAGE_FINISHED;
                self.success = false;
                self.msg = e.toString();
                done();
            }

            function done(){
                GlobalCatcher.unsubscribe(catcher);
                _done.apply(null, arguments);
            }

            self.stage = TEST_STAGE_RUNNING;
            GlobalCatcher.subscribe(catcher);

            forceAsync(function(){
                if (self.async){
                    if (self.timeout){
                        self.timeout = setTimeout(function(){
                            self.time = Date.now() - time;
                            self.stage = TEST_STAGE_KILLED;
                            self.killed = true;
                            self.success = false;
                            self.timedout = true;
                            self.msg = "Test exceeded timeout";
                            done();
                        }, self.timeout);
                    }
                    self.fn(new Referee(function(success, msg){
                        if (self.timeout) clearTimeout(self.timeout);
                        if (self.stage === TEST_STAGE_FINISHED){
                            var e = Error("Test already finished");
                            e.test = self;
                            throw e;
                        }
                        if (!self.killed){
                            self.time = Date.now() - time;
                            self.stage = TEST_STAGE_FINISHED;
                            self.success = success;
                            self.msg = msg;
                            done();
                        }
                    }));
                } else {
                    self.fn();
                    self.time = Date.now() - time;
                    self.stage = TEST_STAGE_FINISHED;
                    self.success = true;
                    done();
                }
            });
        },

        // 3. teardown
        function(done){
            self.stage = TEST_STAGE_TEARDOWN;

            async.eachSeries(self.teardown || [], function(teardownFn, _done){
                function done(){
                    GlobalCatcher.unsubscribe(done);
                    _done.apply(null, arguments);
                }
                GlobalCatcher.subscribe(done);

                forceAsync(function(){
                    // async / sync teardown?
                    if (teardownFn.length > 0) teardownFn(done);
                    else {
                        teardownFn();
                        done();
                    }
                });
            }, function(err){
                if (err){
                    self.success = false;
                    self.teardownSuccess = false;
                    self.msg = err.toString();
                    return done("teardown");
                }
                self.teardownSuccess = true;
                done();
            });
        },

    ], function(err){
        // err just indicates the failure stage ("setup"/"teardown") and is
        // already taken care of. move on to the next test.
        done();
    });
};

module.exports = Test;

})(void 0);
