export interface IProductImage {
    public_id: string;
    url: string;
    _id?: string;
};

export interface IReview {
    user: string;
    name: string;
    rating: number;
    comment: string;
    _id?: string;
    createdAt?: string;
}

export interface IReviewResponse {
    success: boolean;
    message: string;
}

export interface IProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    brand: string;
    stock: number;
    processor: string;
    ram: string;
    storage: string;
    screenSize: number;
    ratings: number;
    numOfReviews: number;
    images: IProductImage[];
    reviews?: IReview[];
    user: string; // Creator ID
    createdAt: string;
    updatedAt: string;
}

export interface IProductResponse {
    success: boolean;
    count: number;
    total: number;
    products: IProduct[];
}

export interface ISingleProductResponse {
    success: boolean;
    product: IProduct;
}

export interface IProductQueryParams {
    keyword?: string;
    category?: string;
    brand?: string;
    page?: number;
    limit?: number;
    'price[gte]'?: number;
    'price[lte]'?: number;
    sort?: string;
}