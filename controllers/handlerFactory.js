const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {  
    const doc = await Model.findByIdAndDelete(req.params.id);
    
    if(!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
      });
});

exports.updateOne = Model => catchAsync(async (req, res, next) => { 
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }); // new = true is an option that we include so that DB returns new object

    if(!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      },
    });
});

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(populateOptions) query = query.populate(populateOptions);
    const doc = await query;
    
    if(!doc) {
      return next(new AppError('No doc found with that id', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
          data: doc
        },
    });
}); 

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {}
    if(req.params.tourId) filter = { tour: req.params.tourId};

    //BUILD QUERY : All of this code is now part of APIFeatures Class
    // All the above steps are chained with each other to form the query which is then executed asynchronously
    const features = new APIFeatures(Model.find(filter), req.query) // chaining of queries
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query //.explain(); // explain method is used to find out executions stats inorder to set indexes

    //SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc
      }
    });
});