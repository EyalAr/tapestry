function Referee(done){
    this.done = done;
}

Referee.prototype.Ok =
Referee.prototype.OK =
Referee.prototype.ok = function(msg){
    this.done(true, msg);
};

Referee.prototype.notok =
Referee.prototype.notOK =
Referee.prototype.notOk = function(msg){
    this.done(false, msg);
};

Referee.prototype.assert = function(bool, msg){
    this.done(!!bool, msg);
};

module.exports = Referee;
