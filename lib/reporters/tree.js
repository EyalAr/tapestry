(function(){ 'use strict';

var TEST_RUNNING = {symbol: '\u2799', color: 'yellow'},
    TEST_OK = {symbol: '\u2714', color: 'green'},
    TEST_NOT_OK = {symbol: '\u2718', color: 'red'},
    TEST_TODO_OK = {symbol: '\u25C9', color: 'cyan'},
    TEST_TODO_NOT_OK = {symbol: '\u25D0', color: 'magenta'},
    TEST_SKIP = {symbol: '\u279A', color: 'yellow'},
    TEST_TIMEOUT = {symbol: '\u29D7', color: 'red'},
    TEST_UNKNOWN = {symbol: '?', color: 'gray'},
    INDENT = '  ';

var Suite = require('../core/Suite'),
    chalk = require('chalk'),
    queue = [],
    descStack = [],
    running = false,
    counters = {
        fail: 0,
        timeout: 0,
        todoFail: 0,
        pass: 0,
        todoPass: 0,
        skip: 0,
        unknown: 0
    },
    time = 0,
    hooks = {
        test: {},
        suite: {}
    };

if (!process.stdout){
    process.stdout = {
        write: require('../util/writeShim')(console.log.bind(console))
    };
}
if (!process.stderr){
    process.stderr = process.stderr || {
        write: require('../util/writeShim')(console.error.bind(console))
    };
}
if (!process.exit){
    process.exit = function(code){
        console.log("Exited with code " + code);
    };
}

function colorize(state, msg){
    msg = msg || '';
    return chalk[state.color](state.symbol + msg);
}

hooks.test.pre = function(test){
    descStack.push(test.meta.desc);

    var i, line = [];
    for (i = 0; i < descStack.length - 1; i++) line.push(INDENT);
    line.push(colorize(TEST_RUNNING));
    line.push(test.meta.desc);
    print.apply(null, line);
};

hooks.test.post = function(test){
    var i,
        line = [],
        skip = test.is('skip'),
        todo = test.is('todo'),
        timedout = test.timedout;
    for (i = 0; i < descStack.length - 1; i++) line.push(INDENT);
    if (skip){
        counters.skip++;
        line.push(colorize(TEST_SKIP));
    } else if (test.success){
        counters.pass++;
        if (!todo) line.push(colorize(TEST_OK));
        else {
            counters.todoPass++;
            line.push(colorize(TEST_TODO_OK));
        }
    } else {
        if (todo){
            counters.todoFail++;
            line.push(colorize(TEST_TODO_NOT_OK));
        } else if (timedout){
            counters.timeout++;
            line.push(colorize(TEST_TIMEOUT));
        } else if (!test.setupSuccess || !test.teardownSuccess){
            counters.unknown++;
            line.push(colorize(TEST_UNKNOWN));
        } else {
            counters.fail++;
            line.push(colorize(TEST_NOT_OK));
        }
    }
    line.push(test.meta.desc);
    line.push(chalk[timedout ? "red" : "gray"]("(" + test.time + "ms)"));
    print("\r");
    println.apply(null, line);
    descStack.pop();
    time += test.time;
};

hooks.suite.pre = function(suite){
    descStack.push(suite.meta.desc);
    var i, line = [];
    for (i = 0; i < descStack.length - 1; i++) line.push(INDENT);
    line.push(suite.meta.desc);
    println.apply(null, line);
};

hooks.suite.post = function(suite){
    descStack.pop();
};

function println(){
    var args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.join(" ") + "\n");
}

function print(){
    var args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.join(" "));
}

function queueSuite(desc, fn){
    queue.push([desc, fn]);
    next();
}

function next(){
    if (!running && queue.length){
        var suite = queue.shift();
        descStack.push(suite[0]);
        suite = new Suite({desc: suite[0],
            root: true
        }, suite[1], null, hooks);
        running = true;
        println(suite.meta.desc);
        suite.run(function(result){
            descStack.pop();
            running = false;
            if (!queue.length) summarize();
            else next();
        });
    }
}

function summarize(){
    var total = counters.pass +
        counters.fail +
        counters.skip +
        counters.todoFail +
        counters.timeout +
        counters.unknown;
    println(chalk.gray(total + " total in " + time + "ms"));
    println(colorize(TEST_OK, " " + counters.pass + " passed"));
    if (counters.fail)
        println(colorize(TEST_NOT_OK, " " + counters.fail + " failed"));
    if (counters.timeout)
        println(colorize(TEST_TIMEOUT, " " + counters.timeout + " timed out"));
    if (counters.skip)
        println(colorize(TEST_SKIP, " " + counters.skip + " skipped"));
    if (counters.todoFail)
        println(colorize(TEST_TODO_NOT_OK, " " + counters.todoFail + " 'todo' failed"));
    if (counters.todoPass)
        println(colorize(TEST_TODO_OK, " " + counters.todoPass + " 'todo' passed"));
    if (counters.unknown)
        println(colorize(TEST_UNKNOWN, " " + counters.unknown + " unknown result" + (counters.unknown > 1 ? "s" : "")));

    if (counters.fail + counters.timeout) process.exit(1);
    else process.exit(0);
}

module.exports = queueSuite;

})();
