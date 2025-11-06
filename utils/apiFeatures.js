class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) BUILD QUERY
    // 1A) query filtering
    const parsedQuery = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(element => delete parsedQuery[element]);

    // 1B) Advanced query filtering: Convert operators to MongoDB format
    let queryStr = JSON.stringify(parsedQuery);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // 2) SORTING
    // const mongoQuery = JSON.parse(queryStr);
    // let query = Tour.find(mongoQuery);
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }

    return this;
  }

  limitFields() {
    // 3) FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) PAGINATION
    const page = Number(this.queryString.page * 1) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    // page=2&limit=10 means: tours 1-10 for page 1, 11-20 for page 2, 21-30 for page 3, ...
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default APIFeatures;
