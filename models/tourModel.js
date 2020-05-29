const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const toursSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Max length of tour name is: 40 chars'],
      minlength: [10, 'Min length of tour name is 10 chars'],
      //validate: [validator.isAlpha, 'Tour name must only contain chars A-Z or a-z']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must specify difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either easy medium or difficult'
        }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10 
      // setter will run each time there is a new value we have used this here to roundup
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: { 
            validator: function(val) {
            // this only points to current doc on NEW document creation
            return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be less than actual value'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }, 
    startLocation: {
        // Geo JSON to specify Geo data
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    // guides: Array // Used for embedding documents
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
  },
  {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  });


// toursSchema.index({price: 1}); // 1 is ASC & -1 is DESC
toursSchema.index({price: 1, ratingsAverage: -1}); // 1 is ASC & -1 is DESC
toursSchema.index({slug: 1});
toursSchema.index({ startLocation: '2dsphere'});

toursSchema.virtual('durationWeeks').get(function() {
      return this.duration/7;
  });
  
// Virual Populate
toursSchema.virtual('reviews', {
    ref: 'Review', 
    foreignField: 'tour',
    localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs before the save command and the create command  
toursSchema.pre('save', function(next) {
    console.log(this)
    this.slug = slugify(this.name, {lower: true})
    next();
});

// Below snippet is how we embed guides inside tours document using pre-save
// pre-save only works while creation of new document but to retrieve we need to define some more middleware i.e., find
// toursSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// toursSchema.pre('save', function(next) {
//     console.log('Will save document..!')
//     next();
// })

// toursSchema.post('save', function(doc, next) {
//     console.log(doc);
//     next();
// })

// QUERY MIDDLEWARE 
toursSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true}})
    this.start = Date.now();
    next();
});

toursSchema.pre(/^find/, function(next) {
    this.populate({
       path: 'guides',
       select: '-__v' 
    });
    next();
})

toursSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds.!`);
    // console.log(docs);
    next();
})

// AGGREGATION MIDDLEWARE
// toursSchema.pre('aggregate', function(next) {
//     this.pipeline().unshift({ $match: {secretTour: {$ne: true}}})
//     console.log(this.pipeline());
//     // this.find({ secretTour: {$ne: true}})
//     // this.start = Date.now();
//     next();
// });

const Tour = mongoose.model('Tour', toursSchema);
module.exports = Tour;
