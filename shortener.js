"use strict";

var ShortId = require('short-unique-id');
var uid = new ShortId();
var MongoClient = require("mongodb").MongoClient
  , assert = require('assert');
// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var url = 'mongodb://'+ process.env.USER + ':' + process.env.PASS + '@ds235768.mlab.com:35768/dboydgit-fcc';
var db;
var collection;
var validUrl = require('valid-url');

exports.shorten = function(req, res) {
  var url = req.params[0];
  // if not valid url return error
  if (!validUrl.isWebUri(url)) {
    var response = {
      error: 'Please provide a valid http:// or https:// url'
    }
    res.end(JSON.stringify(response));
  } else {
    var sid = uid.randomUUID(4);
    collection.insertOne({
      url: url,
      uid: sid
    });
    var response = {
      original_url: url,
      short_url: 'https://dbsurl.glitch.me/' + sid
    }
    res.end(JSON.stringify(response));
  }
}

exports.redirect = function(req, res) {
  var rid = req.params.redirect;
  collection.find({uid:rid}).limit(1).each((err,doc) => {
    if (doc) {
      console.log('found entry - redirecting to ' + doc.url);
      res.writeHead(301, {
        Location: doc.url
      });
      res.end();
      return false;
    }
    else res.end('url not in database');
  }
)}

exports.connect = function() {
  // connect to db
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    db = client.db('dboydgit-fcc');
    collection = db.collection('urls');
  });
}