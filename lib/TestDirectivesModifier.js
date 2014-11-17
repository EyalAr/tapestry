function TestDirectivesModifier(test){
    this.test = test;
    this.test.directives = this.test.directives || {};
}

TestDirectivesModifier.prototype.setDirective = function(dir, cond, msg){
    var l = arguments.length;
    if (l === 0) throw Error("Please specify a directive");
    if (typeof cond === 'function') cond = cond();
    if (l === 1){
        this.test.directives[dir] = {
            active: true
        };
    } else {
        if (l === 2 && typeof cond === 'string'){
            msg = cond;
            cond = true;
        }
        this.test.directives[dir] = {
            active: !!cond,
            msg: msg
        };
    }
    return this;
};

TestDirectivesModifier.prototype.todo = function(/* cond, msg */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("todo");
    return this.setDirective.apply(this, args);
};

TestDirectivesModifier.prototype.skip = function(/* cond, msg */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("skip");
    return this.setDirective.apply(this, args);
};

module.exports = TestDirectivesModifier;
