const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// TODOS: email: must be in correct format
const UserSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  emailAddress: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const CourseSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: String,
  materialsNeeded: String,
  steps: [
    {
      stepNumber: Number,
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      }
    }
  ],
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviews: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'Review' 
  }]
});



const ReviewSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  postedOn : {
    type: Date,
    default: Date.now
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: String
})

const userData = [
  { fullName: "Coco Kitty", emailAddress: "coco@coco.com", password: "password" }, 
]

// encrypt the password before saving it to the db
UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

// check the login details
UserSchema.statics.authenticate = function(emailAddress, password, callback) {
  console.log('inside user schema');
  User.findOne({ emailAddress: emailAddress }).exec(function(error, user) {
    if (error) {
      return callback(error);
    } else if (!user) {
      let err = new Error('User not found');
      err.status = 401;
      return callback(err);
    }
    bcrypt.compare(password, user.password, function(error, result) {
      console.log('comparing');
      if (result === true) {
        console.log('tru');
        return callback(null, user);
      } else {
        return callback();
      }
    });
  });
};


const User = mongoose.model('User', UserSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Course = mongoose.model('Course', CourseSchema);

const user = new User(userData);

User.create(userData, function(err, users) {
  if (err) console.error(err);
});


module.exports.Review = Review;
module.exports.User = User;
module.exports.Course = Course;