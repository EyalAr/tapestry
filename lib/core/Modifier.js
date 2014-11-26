(function(){ 'use strict';

var decree = require('decree');
decree.register('nonboolean', function(v){
    return typeof v !== 'boolean';
});

var setDirectiveJudge = decree([{
    name: 'directive',
    type: 'string'
}, {
    name: 'condition',
    types: ['boolean', 'function'],
    optional: true,
    default: true
}, {
    name: 'value',
    type: 'nonboolean',
    optional: true
}]);

function Modifier(instance){
    this.instance = instance;
}

function setDirective(){
    var args = setDirectiveJudge(arguments),
        dir = args[0],
        cond = args[1],
        val = args[2];
    var l = arguments.length;
    if (typeof cond === 'function') cond = cond();
    if (cond){
        this.instance[dir] = val || true;
    } else {
        delete this.instance[dir];
    }
    return this;
};

Modifier.prototype.todo = function(/* cond, msg */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("todo");
    return setDirective.apply(this, args);
};

Modifier.prototype.skip = function(/* cond, msg */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("skip");
    return setDirective.apply(this, args);
};

Modifier.prototype.timeout = function(/* cond, ms */){
    var args = Array.prototype.slice.call(arguments);
    args.unshift("timeout");
    return setDirective.apply(this, args);
};

Modifier.prototype.setup = function(fn){
    this.instance.setup = this.instance.setup || [];
    this.instance.setup.push(fn);
    return this;
};

Modifier.prototype.teardown = function(fn){
    this.instance.teardown = this.instance.teardown || [];
    this.instance.teardown.push(fn);
    return this;
};

module.exports = Modifier;

})();
