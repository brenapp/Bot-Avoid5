/**
 * State - Super simple program location for node (and the browser, presumably, I'm too lazy to port)
 * Usage:
 *     var State = require("./lib/State");
 *
 *     State["Doing Job A"]
 *     ...
 *     State["Doing Job A"].done()
 *
 *     // -- OR -- \\
 *
 *     State["Doing Job A"]
 *     ...
 *     State["Doing Job A"].error("We done messed up")
 *
 *     // -- OR -- \\
 *
 *     ...
 *     State["Doing Job A"].done();
 *
 *
 * Upon first access, it will print the job title, and will also return the control object, which it will do for subsequent jobs
 **/
var handler = {
  get(target, name) {
    if(!target[name]) {
      process.stdout.write(`${name}...`)
      target[name] = true;
    }
    return {
      "done": function() {
        console.log("Done");
        target[name] = false;
      },
      "error": function(error) {
        console.log("Error")
        target[name] = false;
        throw error;

      }
    }
  }
}

var State = new Proxy({}, handler);

module.exports = State;
