(function(){ 'use strict';

var TEST_STAGE_IDLE = 0,
    TEST_STAGE_RUNNING = 1,
    TEST_STAGE_FINISHED = 2;

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
}

Test.prototype.run = function(done){
    var self = this,
        time = Date.now();
    self.stage = TEST_STAGE_RUNNING;
    try{
        if (self.async){
            self.fn(new Referee(function(success, msg){
                if (self.stage === TEST_STAGE_FINISHED){
                    var e = Error("Test already finished");
                    e.test = self;
                    throw e;
                }
                self.time = Date.now() - time;
                self.stage = TEST_STAGE_FINISHED;
                self.success = success;
                self.msg = msg;
                done();
            }));
        } else {
            self.fn();
            self.time = time - Date.now();
            self.stage = TEST_STAGE_FINISHED;
            self.success = true;
            done();
        }
    } catch (e){
        self.time = time - Date.now();
        self.stage = TEST_STAGE_FINISHED;
        self.success = false;
        self.msg = e.toString();
        done();
    }
};

module.exports = Test;

})();
