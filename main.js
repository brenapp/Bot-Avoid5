var State       = require("./lib/state"),
    credentials = require("./credentials"),
    snoowrap    = require("snoowrap"),
    snoostorm   = require("snoostorm"),
    colors      = require("colors"),
    fs          = require("fs");


let marked = fs.createWriteStream("marked.csv", {flags: "a"});


/**
 * stripToRelevant - strip a reddit content peice to its relevant content, i.e. remove URLS and Users Mentions
 * @param  {string} text The text to filter
 * @return {string}      The text without URLs and User Mentions
 */
function stripToRelevant(text) {

  let url  = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
      user = /\/u\/[A-z-_0-9]+/gi

  return text.replace(url, "").replace(user, "");

}


/**
 * findIllegalSections - Divides a string into sections by comment dividers, like punctuation and parenthses, and find the ones which violate the 'e' rule
 * One of the things which the users seemed to like in the python version of this code was this helpful guide to help you find all of the parts of your post which violate this rule, hence why I didn't just use .indexOf()
 * @param  {string} text The text to filter
 * @return {array}       The array of illegal sections
 */
function findIllegalSections(text) {
  let sections = text.split(/[,.();:!?\n"']/g);

  return sections.filter(
    a => a.toLowerCase().indexOf("e") > -1
  );
}


State["Connecting to Reddit API"]
var client = new snoowrap(credentials),
    streaming = new snoostorm(client);

    var comments = streaming.CommentStream({
      "subreddit": "AskReddit"
    });
    var submissions = streaming.SubmissionStream({
      "subreddit": "AskReddit"
    });
State["Connecting to Reddit API"].done();

// TODO: Convert this library to a streaming one, these events look bad
comments.on("comment", function(comment) {
  let illegalSections = findIllegalSections(stripToRelevant(comment.body));


  if (illegalSections.length > 0) {
    console.log(`Illegal Comment by ${comment.author.name.green} (${illegalSections.length} illegal sections)`);
    marked.write(`${comment.id},comment\n`);

    let response = [
      "Hi! Your annotation contains a fifth glyph",
      "",
      "Violations:",
      
    ].join("\n");




  }
})

submissions.on("submission", function(submission) {
  let body = submission.title + submission.selftext;


})
