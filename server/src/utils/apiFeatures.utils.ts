import { Query } from "mongoose";

interface QueryString {
    keyword?: string,
    sort?: string,
    page?: string,
    limit?: string,
    [key: string]: any, // other fields (price[gte], category, etc.)
}

export class APIFeatures {
    query: Query<any[], any>; // Mongoose Query (e.g., Product.find())
    queryString: QueryString; // Express Request Query (e.g., req.query)

    constructor(query: Query<any[], any>, queryString: QueryString) {
        this.query = query;
        this.queryString = queryString;
    }

    /**
     * Search functionality (Dynamic Fields Support)
     * @param searchFields - ရှာဖွေလိုသော field နာမည်များ (Default: ['name'])
     */
    search(searchFields: string[] = ['name']) {
        if (this.queryString.keyword) {
            const keyword = {
                $or: searchFields.map((field) => ({
                    [field]: {
                        $regex: this.queryString.keyword,
                        $options: 'i' // case-insensitive
                    }
                }))
            };
            this.query = this.query.find(keyword);
        }
        
        return this;
    }

    // Filter (Category, Price Range, Brand)
    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['keyword', 'page', 'sort', 'limit'];
        excludedFields.forEach((element) => delete queryObj[element]);

        const nestedQueryObj: any = {};

        for (const key in queryObj) {
            // Check if key looks like "field[operator]" (e.g., price[gte])
            const match = key.match(/^(\w+)\[(\w+)\]$/);
            
            if (match) {
                const field = match[1]; // price
                const operator = match[2]; // gte
                
                if (!nestedQueryObj[field]) nestedQueryObj[field] = {};
                nestedQueryObj[field][operator] = queryObj[key];
            } else {
                // Normal field (e.g., category=business)
                nestedQueryObj[key] = queryObj[key];
            }
        }

        let queryStr = JSON.stringify(nestedQueryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
        
        const parsedQueryObj = JSON.parse(queryStr);

        // 4. Type Casting (String -> Number) for specific fields
        for (const key in parsedQueryObj) {
            // Handle Nested Objects (e.g., price: { $gte: '1000' })
            if (typeof parsedQueryObj[key] === 'object' && parsedQueryObj[key] !== null) {
                if (['price', 'stock', 'screenSize'].includes(key)) {
                    for (const operator in parsedQueryObj[key]) {
                        parsedQueryObj[key][operator] = parseFloat(parsedQueryObj[key][operator]);
                    }
                }
            } 
            // Handle Exact Match (e.g., price: '1000')
            else if (['price', 'stock', 'screenSize'].includes(key) && typeof parsedQueryObj[key] === 'string') {
                parsedQueryObj[key] = parseFloat(parsedQueryObj[key]);
            }
        }
        // Debug Log (To verify the fix)
        // console.log("✅ Final Filter Object:", JSON.stringify(parsedQueryObj, null, 2));

        this.query = this.query.find(parsedQueryObj);
        return this;
    }

    sort() {
        if (this.queryString.sort) {
            // eg: sort=price,createdAt (The comma must be changed to a space => "price createdAt")
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            // Default sort: Newest first
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }

    paginate() {
        const page = parseInt(this.queryString.page || '1') * 1 || 1; // Current Page
        const limit = parseInt(this.queryString.limit || '10') * 1 || 10; // Items per page
        const skip = (page - 1) * limit; // Number of items to skip
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}