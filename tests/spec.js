var app = require('../app');
var request = require('supertest');
var chai = require('chai').expect;
const User = require('../models').User;

/* to run the tests type mocha tests/spec.js */

describe('user', function() {

// When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
  it('should return a user', function(done) {
    const userData = [{ fullName: 'John Smith', emailAddress: 'john@smith.com', password: 'password' }];
    User.create(userData, function(err, users) {
     request(app)
       .get('/api/users')
       .set('Accept', 'application/json')
       .set('Authorization', 'Basic am9lQHNtaXRoLmNvbTpwYXNzd29yZA==')
       .expect('Content-Type', /json/)
       .expect(200)
       .end(function(err, resp) {
         if (err) return done(err);
         done();
       });
      });
  });

  //When I make a request to the GET /api/users route with invalid credentials, a 401 status error is returned
  it('should return a 401 if the credentials are invalid', function(done) {
     request(app)
      .get('/api/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic bad auth')
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function(err, resp) {
        chai(resp.body.error.message).to.eql('Credentials required.');
        done();
      });
  })
});
