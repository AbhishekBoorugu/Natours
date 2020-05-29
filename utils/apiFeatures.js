
class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    } 
  
    filter() {
      // 1a. Filtering 
      /* Below statement here creates a hard copy of the queryObj rather than
        just the referene which happens if we use queryObj = req.query
        ES6 destructuring trick is used here to destructure and then curly brackets wrap them into object
        finally the new object is created for queryObj*/
      
      const queryObj = {...this.queryString};
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach( el => delete queryObj[el])
  
      // 1b. Advanced Filtering 
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      // console.log(JSON.parse(queryStr));
      
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }
  
    sort() {
      // Sorting
      if(this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
        // sort('price ratingsAverage')
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() { 
       // 3. Field Limiting
      if(this.queryString.fields) {
          const fields = this.queryString.fields.split(',').join(' ');
          this.query = this.query.select(fields);
      } else {
          this.query = this.query.select('-__v');
      } 
        return this;
    }
    paginate() {
      //4. Pagination
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
  
    return this;
    }
  
  }

module.exports = APIFeatures;