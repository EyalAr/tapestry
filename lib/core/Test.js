(function(){ 'use strict';

var TEST_STAGE_IDLE = 0,
    TEST_STAGE_RUNNING = 1,
    TEST_STAGE_FINISHED = 2,
    TEST_STAGE_KILLED = 3;

var Referee = require('./Referee');

function Test(meta, fn, parent){
    this.meta = meta;
    this.fn = fn;
    this.parent = parent;
    this.async = this.fn.length > 0;
    this.stage = TEST_STAGE_IDLE;
    this.success = undefined;
    this.msg = undefined;
    this.time = undefined;
    this.timeout = 0;
    this.timedout = false;
}

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
