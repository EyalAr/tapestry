(function(){ 'use strict';

function DirectivesModifier(instance){
    this.instance = instance;
    this.instance.directives = this.instance.directives || {};
}

DirectivesModifier.prototype.setDirective = function(dir, cond, msg){
    var l = arguments.length;
    if (l === 0) throw Error("Please specify a directive");
    if (typeof cond === 'function') cond = cond();
    if (l === 1){
        this.instance.directives[dir] = {
            active: true
        };
    } else {
        if (l === 2 && typeof cond === 'string'){
            msg = cond;
            cond = true;
        }
        this.instance.directives[dir] = {
            active: !!cond,
            msg: msg
        };
    }
    return this;
};

DirectivesModifier.prototype.todo = function(/* cond, msg */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("todo");
    return this.setDirective.apply(this, args);
};

DirectivesModifier.prototype.skip = function(/* cond, msg */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("skip");
    return this.setDirective.apply(this, args);
};

module.exports = DirectivesModifier;

})();