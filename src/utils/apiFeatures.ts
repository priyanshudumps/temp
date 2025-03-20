import { Query, Document, Model } from 'mongoose';

interface QueryString {
  [key: string]: string;
}

class APIFeatures<T extends Document> {
  query: Query<T[], T>;
  queryString: QueryString;

  constructor(query: Query<T[], T>, queryString: QueryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(): APIFeatures<T> {
    const queryObj: QueryString = { ...this.queryString };
    const excludedFields: string[] = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    
    this.query = this.query.find(JSON.parse(queryStr)) as Query<T[], T>;
    return this;
  }

  sort(): APIFeatures<T> {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy) as Query<T[], T>;
    } else {
      this.query = this.query.sort("-createdAt") as Query<T[], T>;
    }
    return this;
  }

  limitFields(): APIFeatures<T> {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields) as Query<T[], T>;
    } else {
      this.query = this.query.select("-__v") as Query<T[], T>;
    }
    return this;
  }

  paginate(): APIFeatures<T> {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 100;
    const skip = (page - 1) * limit;
    
    this.query = this.query.skip(skip).limit(limit) as Query<T[], T>;
    return this;
  }
}

export default APIFeatures;