var db = require('../db/schema.js');
var Friend = require('../models/friend.js');

var Friends = new db.Collection();

Friends.model = Friend;

module.exports = Friends;
