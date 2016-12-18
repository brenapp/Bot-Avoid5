var snoocore    = require("snoocore"),
    credentials = require("./credentials");

var reddit = new Snoocore({
  userAgent: 'AvoidBot (v0.0.0) by /u/MayorMonty',
  oauth: {
    type: 'script',
    key: credentials.key,
    secret: credentials.secret,
    username: credentials.username,
    password: credentials.password,
    // make sure to set all the scopes you need.
    scope: [ 'flair', 'identity' ]
  }
});
