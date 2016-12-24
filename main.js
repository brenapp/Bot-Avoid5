var State       = require("./lib/state"),
    credentials = require("./data/credentials"),
    snoowrap    = require("snoowrap"),
    snoostorm   = require("snoostorm"),
    colors      = require("colors"),
    fs          = require("fs"),
    url         = require("url")
    wordpos     = new (require("wordpos")),
    cache       = require("./data/cache"),
    marked      = require("./data/marked")


let debug  = fs.createWriteStream("debug.md", {flags: "a"});

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
  let sections = text.split(/[,.();:!?\n"]/g);

  return sections.filter(
    a => a.indexOf("e") > -1 || a.indexOf("E") > -1
  );
}


/**
 * createResponse - Creates a response based on the illegal sections of a post
 * @param  {string[]} illegalSections An Array of Strings Containing the illegal sections
 * @return {Promise}                  A Promise which resolves with the response in a string
 */
function createResponse(illegalSections, post) {
  /**  HELPER FUNCTIONS  **/
  /**
   * convertToList - Convert an Array to a String list, with or on the final item
   * @param  {String[]} strings The Array (of strings) to pass
   * @return {String}           The String List
   */
  function convertToList(strings) {

    if(strings.length < 2) return strings[0] || ""

    strings[strings.length - 1] = "or " + strings[strings.length - 1]
    return strings.reduce(
      (a, b) => `${a}, ${b}`
    )

  }
  /**
   * format - Format a string according to reddit's simplified markdown
   * @param  {String} input   The string to format
   * @param  {Object} options The options object to specify formatting, see below
   * @return {String}         The Formatted String
   *
   * options = {
   *   bold: false,
   *   italics: false
   * }
   */
  function format(input, options) {
    return
      options.italics ? "*"  : "" +
      options.bold    ? "**" : "" +
      input                       +
      options.italics ? "*"  : "" +
      options.bold    ? "**" : "";
  }



  return Promise.all(
    illegalSections.map(
      section =>
        Promise.all(
          section.split(" ").filter(word => word.indexOf("e") > -1).map(word => wordpos.lookup(word))
        )
    )
  ).then(function(response) {
                //      [illegal section][word][definition]
      let synonyms = response.map(
        section =>
          section.map(
            word =>
              word.map(
                definition =>
                  definition
                    .filter(synonym => synonym.indexOf("e") === -1 && synonym.indexOf("E") === -1) // <== We only care about fifthless synonyms
                    .map(synonym => synonym.replace(/_/g, " "))     // <== The WordnetDB uses underscores instead of spaces
              ).reduce((a,b) => a.concat(b))
          )
      );


      // Why do I choose to array join over template strings? Because template strings don't take in account for indentation, making them actually the worse solution for multiline strings, and the fact I can do things like the spread operator
      // .map(
      //  (section, index) =>
      //    (wordCount = 0, " > " + section.replace(/\b\w*e\w*\b/ig, word => format(word, {italics: true}) + synonyms[index][wordCount++].length > 0 ? ` (try ${convertToList(synonyms[index][wordCount].map(word=>format(word, {bold: true})))})` : "") + "\n")
      //)
      let body = [
        `Hi /u/${post.author.name}! Your post contains that fifth glyph`,
        "",
        "Infractions:",
        ...illegalSections.map(
          (section, index) =>
            " > " + (wordCount = 0,
                     section.replace(
                       /\b\w*e\w*\b/ig,
                       word =>
                        `*${word.replace(/e/ig, "-")}*` +
                        ` (try ${convertToList(synonyms[index][wordCount++].map(word=>"**"+word+"**"))})`
                     ) + "\n")
        ),
        "---",
        "[instructions](https://github.com/MayorMonty/Bot-Avoid5) | [Anything Wrong?](https://www.reddit.com/message/compose?to=MayorMonty&subject=On%20AvoidBot%20&message=(Drop%2520a%2520link%2520to%2520your%2520situation%2C%20si%20vous%20pla%C3%AEt)) | [Author: MayorMonty](/u/MayorMonty)"
      ].join("\n")
      return body

  })



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

let incrementor = 0
// TODO: Convert this library to a streaming one, these events look bad
comments.on("comment", function(comment) {
  let illegalSections = findIllegalSections(stripToRelevant(comment.body));

  if (incrementor++ > 20) comments.emit("stop")
  if (illegalSections.length > 0) {
    console.log(`Illegal Comment by ${comment.author.name.green} (${illegalSections.length.toString().bold} illegal sections) – ${comment.id.yellow}`);
    marked.comments.push(comment.id)

    createResponse(illegalSections, comment)
      .then(function(response) {
        debug.write(response + "\n");
      }).catch(e => {throw e})




  }
})

submissions.on("submission", function(submission) {
  let body = submission.title + submission.selftext,
      illegalSections = findIllegalSections(stripToRelevant(body));

  if (illegalSections.length > 0) {
    console.log(`Illegal Submission by ${submission.author.name.green} (${illegalSections.length.toString().bold} illegal sections) – ${submission.id.yellow}`);
    marked.submission.push(submission.id)
    createResponse(illegalSections, submission)
      .then(function(response) {
        debug.write(response + "\n");
      }).catch(e => {throw e})
  }

})
