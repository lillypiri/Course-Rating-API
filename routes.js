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

// GET /api/users 200 - make it return the currently authenticated user
router.get('/users', mid.requiresLogin, function(req, res, next) {
  res.status(200);
  return res.send({ fullName: req.currentUser.fullName });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post('/users', function(req, res, next) {
  console.log('body1', req.body);
  let user = new User(req.body);
  user.save(function(err, user) {
    if (err) {
      return next(err);
    }
    req.session.userId = user._id;
    res.status(201);
    res.location('/');
    res.end();
  });
});

/* COURSE routes */
// GET /api/courses 200 - Returns the Course "_id" and "title" properties
router.get('/courses', function(req, res, next) {
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
router.get('/courses/:cID', (req, res, next) => {
  Course.find({ _id: req.params.cID }).populate('user', 'fullName').populate({ path: 'reviews', populate: { path: 'user', select: 'fullName' }}).exec(function(err, courses) {
    if (err) return next(err);
    if (courses.length === 0) return next(new Error('No course found'));
    return res.json(courses[0]);
  });
});

// POST /api/courses 201 - Creates a course, sets the Location header, and returns no content
router.post('/courses', mid.requiresLogin, function(req, res, next) {
  console.log('course body', req.body);
  let course = new Course(req.body);
  course.save(function(err, course) {
    if (err) {
      return next(err);
    }
    res.status(201);
    res.location('/');
    res.end();
  });
});

// PUT /api/courses/:courseId 204 - Updates a course and returns no content
router.put('/courses/:cID', mid.requiresLogin, function(req, res, next) {
  console.log('update course', req.body);
  req.course.update(req.body, function(err, result) {
    if (err) return next(err);
    res.status(204);
    res.end();
  });
});

// POST /api/courses/:courseId/reviews 201 - 
// Creates a review for the specified course ID, sets the Location header to the related course, and returns no content
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
