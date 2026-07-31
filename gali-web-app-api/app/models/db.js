const mongoose = require('mongoose');

let MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://anmolroot:EcUq8irxTWUXkLru@babajee.gwcxwd4.mongodb.net/bbm001', function(err, client){
  if(err) throw err;
  let db = client.db('test');
  db.collection('devices').find().toArray(function(err, result){
    if(err) throw err;
    console.log(result);
    client.close();
    });
 });