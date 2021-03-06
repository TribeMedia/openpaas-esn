'use strict';

var expect = require('chai').expect;
var mockery = require('mockery');

describe('The messages middleware', function() {
  describe('The canReplyTo fn', function() {
    it('should call next if req.body.replyTo is undefined', function(done) {
      mockery.registerMock('../../core/message/permission', {});
      mockery.registerMock('../../core/message', {});
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
        }
      };
      middleware(req, {}, done);
    });

    it('should send back 400 if messageModule.get returns error', function(done) {
      mockery.registerMock('../../core/message/permission', {});
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback(new Error());
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        }
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(400);
          done();
        }
      };
      middleware(req, res);
    });

    it('should send back 400 if messageModule.get returns null message', function(done) {
      mockery.registerMock('../../core/message/permission', {});
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback();
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        }
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(400);
          done();
        }
      };
      middleware(req, res);
    });

    it('should send back 403 if messagePermission.canReply returns error', function(done) {
      mockery.registerMock('../../core/message/permission', {
        canReply: function(message, user, callback) {
          return callback(new Error());
        }
      });
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback(null, {_id: id});
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        },
        user: {
        }
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(403);
          done();
        }
      };
      middleware(req, res);
    });

    it('should send back 403 if messagePermission.canReply returns false', function(done) {
      mockery.registerMock('../../core/message/permission', {
        canReply: function(message, user, callback) {
          return callback(null, false);
        }
      });
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback(null, {_id: id});
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        },
        user: {
        }
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(403);
          done();
        }
      };
      middleware(req, res);
    });

    it('should call next if messagePermission.canReply returns true', function(done) {
      mockery.registerMock('../../core/message/permission', {
        canReply: function(message, user, callback) {
          return callback(null, true);
        }
      });
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback(null, {_id: id});
        },
        typeSpecificReplyPermission: function(message, user, replyData, callback) {
          return callback(null, true);
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        },
        user: {
        }
      };
      var res = {
        json: function() {
          done(new Error());
        }
      };
      middleware(req, res, done);
    });


    it('should send back 403 if type specific reply permissions return false', function(done) {
      mockery.registerMock('../../core/message/permission', {
        canReply: function(message, user, callback) {
          return callback(null, true);
        }
      });
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback(null, {_id: id});
        },
        typeSpecificReplyPermission: function(message, user, replyData, callback) {
          return callback(null, false);
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        },
        user: {
        }
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(403);
          done();
        }
      };
      middleware(req, res, done);
    });

    it('should send back 500 if type specific reply permissions are not ok', function(done) {
      mockery.registerMock('../../core/message/permission', {
        canReply: function(message, user, callback) {
          return callback(null, true);
        }
      });
      mockery.registerMock('../../core/message', {
        get: function(id, callback) {
          return callback(null, {_id: id});
        },
        typeSpecificReplyPermission: function(message, user, replyData, callback) {
          return callback(new Error());
        }
      });
      var middleware = this.helpers.requireBackend('webserver/middleware/message').canReplyTo;
      var req = {
        body: {
          inReplyTo: {
            _id: 1
          }
        },
        user: {
        }
      };
      var res = {
        json: function(code) {
          expect(code).to.equal(500);
          done();
        }
      };
      middleware(req, res, done);
    });
  });
});
