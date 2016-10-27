/**
 * Created by nicolas on 10/19/16.
 */
'use strict';
var soajs = require("soajs");
var Mongo = soajs.mongo;
var mongo = null;

function checkForMongo(soajs) {
    if (!mongo) {
        mongo = new Mongo(soajs.registry.coreDB.provision);
    }
}

module.exports = {
    "generateMongoId": function(){
      return new mongo.ObjectId();
    },

    "validateId": function(soajs, cb){
        checkForMongo(soajs);
        try{
            soajs.inputmaskData.id = mongo.ObjectId(soajs.inputmaskData.id);
            return cb(null, soajs.inputmaskData.id);
        }
        catch(e){
            return cb(e);
        }
    },

    "validateUid": function(soajs, cb){
        checkForMongo(soajs);
        try{
            soajs.inputmaskData.uId = mongo.ObjectId(soajs.inputmaskData.uId);
            return cb(null, soajs.inputmaskData.uId);
        }
        catch(e){
            return cb(e);
        }
    },

    "countEntries": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.count(opts.collection, opts.conditions || {}, cb);
    },

    "findEntries": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.find(opts.collection, opts.conditions || {}, opts.fields || null, opts.options || null, cb);
    },

    "findEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.findOne(opts.collection, opts.conditions || {},  opts.fields || null, opts.options || null, cb);
    },

    "saveEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.save(opts.collection, opts.record, cb);
    },

    "insertEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.insert(opts.collection, opts.record, cb);
    },

    "removeEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.remove(opts.collection, opts.conditions, cb);
    },

    "updateEntry": function (soajs, opts, cb) {
        checkForMongo(soajs);
        mongo.update(opts.collection, opts.conditions, opts.fields, opts.options || {}, cb);
    }
};
