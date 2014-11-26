(function(){ 'use strict';

var TEST_STAGE_IDLE = 0,
    TEST_STAGE_RUNNING = 1,
    TEST_STAGE_FINISHED = 2,
    TEST_STAGE_KILLED = 3;

var Referee = require('./Referee');
var async = require('async'),
    Modifier = require('./Modifier'),
    Referee = require('./Referee');

function Test(meta, fn, parent){
    this.meta = meta;
    this.parent = parent;
    this.async = fn.length > 0;
    this.stage = TEST_STAGE_IDLE;
    this.success = undefined;
    this.killed = false;
    this.msg = undefined;
    this.time = undefined;
    this.timeout = 0;
    this.timedout = false;
    this.modifier = new Modifier(this);
    this.fn = fn.bind(this.modifier);
}

Test.prototype.is = function(what){
    return this[what] || this.parent.is(what);
};

Test.prototype.run = function(done){
    var self = this,
        time = Date.now();
    self.stage = TEST_STAGE_RUNNING;
    try{
        if (self.async){
            if (self.timeout){
                self.timeout = setTimeout(function(){
                    self.time = Date.now() - time;
                    self.stage = TEST_STAGE_KILLED;
                    self.success = false;
                    self.timedout = true;
                    self.msg = "Test exceeded timeout";
    if (self.is('skip')){
        self.time = Date.now() - time;
        self.stage = TEST_STAGE_SKIPPED;
        return done();
    }
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
                if (self.stage !== TEST_STAGE_KILLED){
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
    } catch (e){
        self.time = Date.now() - time;
        self.stage = TEST_STAGE_FINISHED;
        self.success = false;
        self.msg = e.toString();
        done();
    }
};

module.exports = Test;

})();
