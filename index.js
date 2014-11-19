(function(){ 'use strict';

var DEFAULT_REPORTER = "tree";

var nopt = require("nopt"),
    argv = (process && process.argv && process.argv.slice(2)) || [],
    opts = {
        "reporter" : [String]
    },
    shorthands = {
        "TAP" : ["--reporter", "TAP"],
        "tap" : ["--reporter", "tap"],
        "tree" : ["--reporter", "tree"],
        "pretty" : ["--reporter", "tree"]
    },
    parsed = nopt(opts, shorthands, argv, 0),
    reporter = parsed.reporter || DEFAULT_REPORTER;

var reporters = {
    'tap': require('./lib/reporters/TAP'),
    'tree': require('./lib/reporters/tree'),
};

module.exports = reporters[reporter.toLowerCase()];

})();
