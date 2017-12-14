var app = require('../app');
var request = require('supertest');
var chai = require('chai').expect;

/* to run the tests type mocha tests/spec.js  THESE TESTS ARE GARBAGE atm*/
describe('user', function() {

// When I make a request to the GET /api/users route with the correct credentials, the corresponding user document is returned
  it('should return a user', function(done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, resp) {
        if(err) return done(err);
        // console.log('RESPONSE body', resp); // => { error: { message: 'Not Found' } }
        // chai(resp.body).to.be.an('object');
        done();
      });
  });

  //When I make a request to the GET /api/users route with invalid credentials, a 401 status error is returned
  it('should return a 401 if the credentials are invalid', function(done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic am9lQHNtaXRoLmNvbwwwwwwTpwYXNzd29yZA==')
      .expect('Content-Type', /json/)
      .expect(401)
      .end(function(err, resp) {
        chai(resp.body).to.be.an('object');
        done();
      });
  })
});
