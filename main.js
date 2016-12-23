var State       = require("./lib/state"),
    credentials = require("./credentials"),
    snoowrap    = require("snoowrap"),
    snoostorm   = require("snoostorm"),
    colors      = require("colors"),
    fs          = require("fs"),
    wordpos     = new (require("wordpos"));


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


/**
 * createResponse - Creates a response based on the illegal sections of a post
 * @param  {string[]} illegalSections An Array of Strings Containing the illegal sections
 * @return {Promise}                  A Promise which resolves with the response in a string
 */
function createResponse(illegalSections) {

  // Problem: we have an array of illegal sections, with an unknown number of illegal words, and we need to lookup synonyms for each one of these words
  // Solution: Turn each illegal section into an array of promises that look up the illegal words and put it into one giant Promise.all
  // When this resolves, it wil look something like this:
  //   [
  //     [{definition}, {definition}, {definition}] // <= Illegal Section #0
  //     [{definition}, {definition}] // <= Illegal Section #1
  //     [{definition}, {definition}, {definition}, {definition}, {definition}] // <= Illegal Section #2
  //     [{definition}, {definition}, {definition}, {definition}, {definition}, {definition}] // <= Illegal Section #3
  //   ]
  return Promise.all(
    illegalSections.map(section =>
      Promise.all(
        // Note: Here I'm assuming that words are split by spaces; it would be better for me to tokenize this, then look it up, but this will do a good enough job
        section.split(" ").filter(word => word.indexOf("e") > -1).map(word => wordpos.lookup(word))
      )
    )
  ).then(function(response) {

  });
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

    createResponse(illegalSections)
      .then(function(response) {

      })




  }
})

submissions.on("submission", function(submission) {
  let body = submission.title + submission.selftext;


})
