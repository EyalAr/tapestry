(function(){ 'use strict';

var TEST_RUNNING = '\u2799',
    TEST_OK = '\u2714',
    TEST_NOT_OK = '\u2718',
    TEST_TODO = '\u273D',
    TEST_SKIP = '\u279A',
    INDENT = '  ';

var Suite = require('../core/Suite'),
    chalk = require('chalk'),
    queue = [],
    descStack = [],
    running = false,
    counters = {
        fail: 0,
        todoFail: 0,
        pass: 0,
        todoPass: 0,
        skip: 0
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

hooks.test.pre = function(test){
    descStack.push(test.meta.desc);

    var i, line = [];
    for (i = 0; i < descStack.length - 1; i++) line.push(INDENT);
    line.push(chalk.yellow(TEST_RUNNING));
    line.push(test.meta.desc);
    print.apply(null, line);
};

hooks.test.post = function(test){
    var i,
        line = [],
        skip = test.directives.skip && test.directives.skip.active,
        todo = test.directives.todo && test.directives.todo.active;
    for (i = 0; i < descStack.length - 1; i++) line.push(INDENT);
    if (skip){
        counters.skip++;
        line.push(chalk.yellow(TEST_SKIP));
    } else if (test.success){
        counters.pass++;
        if (!todo) line.push(chalk.green(TEST_OK));
        else {
            counters.todoPass++;
            line.push(chalk.cyan(TEST_TODO));
        }
    } else {
        if (!todo){
            counters.fail++;
            line.push(chalk.red(TEST_NOT_OK));
        } else {
            counters.todoFail++;
            line.push(chalk.magenta(TEST_TODO));
        }
    }
    line.push(test.meta.desc);
    line.push(chalk.gray("(" + test.time + "ms)"));
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
        counters.todoPass;
    println(chalk.gray(total + " total in " + time + "ms"));
    println(chalk.green(counters.pass + " passed"));
    if (counters.fail)
        println(chalk.red(counters.fail + " failed"));
    if (counters.skip)
        println(chalk.yellow(counters.skip + " skipped"));
    if (counters.todoFail)
        println(chalk.magenta(counters.todoFail + " 'todo' failed"));
    if (counters.todoPass)
        println(chalk.cyan(counters.todoPass + " 'todo' passed"));
}

module.exports = queueSuite;

})();
