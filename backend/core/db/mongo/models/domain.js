'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DomainSchema = new Schema({
  name: {type: String, required: true},
  company_name: {type: String, required: true},
  timestamps: {
    creation: {type: Date, default: Date.now}
  },
  schemaVersion: {type: Number, default: 1}
});

DomainSchema.statics = {

  /**
   * check the existence of a Domain where company_name: name
   *
   * @param {String} name
   * @param {Function} cb
   */
  testCompany: function(name, cb) {
    var query = {company_name: name};
    this.findOne(query, cb);
  }
};

module.exports = mongoose.model('Domain', DomainSchema);