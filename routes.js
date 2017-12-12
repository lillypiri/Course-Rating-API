'use strict';

const express = require('express');
const router = express.Router();
const User = require('./models').User;
const Course = require('./models').Course;
const Review = require('./models').Review;
const mid = require('./middleware');



// Incoming requests to the database handled here in route handlers - use Mongoose to persist/retrieve the data.


// get user id
router.param('uID', function(req, res, next, id) {
  User.findById(id, function(err, doc) {
    if (err) return next(err);
    if (!doc) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    }
    req.user = doc;
    return next();
  });
});

// get course id
router.param('cID', function(req, res, next, id) {
  Course.findById(id, function(err, doc) {
    if (err) return next(err);
    if (!doc) {
      err = new Error('Not Found');
      err.status = 404;
      return next(err);
    }
    req.course = doc;
    return next();
  });
});

/* USER routes */
// in postman make content-type application/x-www-form-urlencoded
// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', function(req, res, next) {
  console.log('body1', req.body);
  let user = new User(req.body);
  user.save(function(err, user) {
    if (err) {
      return next(err);
    }
    res.status(201);
    res.location('/');
    res.end();
    //res.json(user);
  });
});

// GET /api/users 200 - make it return the currently authenticated user
router.get('/users', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId).exec(function(error, user) {
    if (error) {
      return next(error);
    }  else if (user === null) {
      return res.send('You need to be logged in to view this page.');
    } else {
      res.status(200);
      console.log('maybe logged in?', user);
      return res.send({ fullName: user.fullName });
    }
  });
});

router.get('/users/all', function(req, res) {
  User.find({}).exec(function(err, users) {
    if (err) return next(err);
    res.json(users);
  });
});

// POST /login
router.post('/login', function(req, res, next) {
  if (req.body.emailAddress && req.body.password) {
    User.authenticate(req.body.emailAddress, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.end();  
      }
     });
  } else {
    console.log("body login", req.body.emailAddress, req.body.password)
    var err = new Error('Email and password are required');
    err.status = 401;
    return next(err);
  }
});


// route for a specific user - need to make this authenticated user
router.get('/users/:uID', (req, res, next) => {
  res.json(req.user);
});



/* COURSE routes */
// GET /api/courses 200 - Returns the Course "_id" and "title" properties
router.get('/courses', mid.requiresLogin, function(req, res, next) {
  Course.find({}).exec(function(err, courses) {
    if (err) return next(err);
    // res.json ends the req/res cycle, so loop over the courses and store it in an array. Then pass to the response object outside of the loop
    let courseData = [];
    courses.forEach((item) => {
      let itemObject = item.toObject();
      courseData.push({
        _id: item._id,
        title: item.title
      });
    })
    res.status(200);
    res.json(courseData);
  });
});

// GET /api/courses/:courseId 200 - Returns all Course properties and related user and review documents for the provided course ID
router.get('/courses/:cID', mid.requiresLogin, (req, res, next) => {
  res.json(req.course);
});

// POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
router.post('/courses', function(req, res, next) {
  console.log('course body', req.body);
  let course = new Course(req.body);
  course.save(function(err, course) {
    if (err) {
      return next(err);
    }
    res.status(201);
    res.location('/');
    res.end();
    // res.json(course);
  });
});

// CHECK THIS IS OK
// PUT /api/courses/:courseId 204 - Updates a course and returns no content
router.put('/courses/:cID', function(req, res, next) {
  console.log('update course', req.body);
  req.course.update(req.body, function(err, result) {
    if(err) return next(err);
    res.status(204);
    res.end();
  })
});

// POST /api/courses/:courseId/reviews 201 - 
// Creates a review for the specified course ID, sets the Location header to the related course, 
// and returns no content
router.post('/courses/:cID/reviews', mid.requiresLogin, function(req, res, next) {
  console.log('creating a review', req.body);
  let review = new Review(req.body);
  review.save(function(err, course) {
    if (err) {
      return next(err);
    }
    res.status(201);
    res.location('/')
    res.json();
  })
});

module.exports = router;
