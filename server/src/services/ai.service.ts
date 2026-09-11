import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";

// Price Extraction from User Query
const extractMaxPriceFromQuery = (query: string): number | null => {
    // Capturing patterns like $1000, 1000$, 1000 USD, under 1000
    const match = query.match(/(?:under|below|\$)\s*(\d+)|(\d+)\s*(?:\$|usd|dollars)/i);
    if (match) {
        const price = parseInt(match[1] || match[2], 10);
        return isNaN(price) ? null : price;
    }
    return null;
};

// LightWeight RAG: Retrieve from the DB only products that most closely match the user query and are in stock
const retrieveRelevantProducts = async (userQuery: string) => {
    const maxPrice = extractMaxPriceFromQuery(userQuery);

    const filterQuery: Record<string, any> = {
        stock: { $gt: 0 },
    };

    if (maxPrice) {
        filterQuery.price = { $lte: maxPrice };
    }

    const keywords = userQuery
        .toLowerCase()
        .split(' ')
        .filter((word) => word.length > 2 && !['laptop', 'need', 'want', 'show', 'best', 'under', 'with'].includes(word));

    if (keywords.length > 0) {
        filterQuery.$or = keywords.map((kw) => ({
            $or: [
                { name: { $regex: kw, $options: 'i' } },
                { processor: { $regex: kw, $options: 'i' } },
                { ram: { $regex: kw, $options: 'i' } },
                { description: { $regex: kw, $options: 'i' } },
            ],
        }));
    }

    let products = await Product.find(filterQuery)
        .select('name price processor ram storage screenSize ratings brand category stock')
        .populate('brand', 'name')
        .populate('category', 'name')
        .sort({ ratings: -1, price: 1 })
        .limit(8)
        .lean();

    if (products.length === 0) {
        products = await Product.find({ stock: { $gt: 0 } })
            .select('name price processor ram storage screenSize ratings brand category stock')
            .populate('brand', 'name')
            .populate('category', 'name')
            .sort({ ratings: -1 })
            .limit(8)
            .lean();
    }

    return products;
}

export const askAiAdvisorService = async (userPrompt: string): Promise<string> => {
    // API Key Availability Guard
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        throw new AppError('Gemini API key is not configured on the server.', 500);
    }

    // RAG Step: Retrieve Filtered Product Context
    const relevantProducts = await retrieveRelevantProducts(userPrompt);

    if (!relevantProducts || relevantProducts.length === 0) {
        return 'Currently, we do not have any in-stock laptops matching your specific criteria. Please check back later or try adjusting your requirements!';
    }

    // Creating Clean Structured Data to Reduce Payload to Gemini
    const catalogContext = relevantProducts.map((p) => ({
        name: p.name,
        price: `$${p.price}`,
        specs: `${p.processor}, ${p.ram} RAM, ${p.storage} Storage, ${p.screenSize}" Display`,
        brand: (p.brand as any)?.name || 'Generic',
        category: (p.category as any)?.name || 'Laptop',
        rating: `${p.ratings} / 5`,
        inStock: p.stock,
    }));

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use Gemini Native System Instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `
        You are the official AI Laptop Advisor for "LaptopVerse" e-commerce store.
        Your goal is to recommend the ideal laptop from our current in-stock catalog.

        Strict Rules:
        1. ONLY recommend laptops provided in the catalog context below. Never invent or hallucinate laptops.
        2. Keep your answer concise, polite, and well-structured using Markdown formatting.
        3. Always highlight the Name, Specs, Price, and why it fits the user's specific request.
        4. If no exact fit exists in the provided catalog, suggest the closest available alternative from the catalog.

        Current Catalog Context:
        ${JSON.stringify(catalogContext, null, 2)}
      `,
            generationConfig: {
                temperature: 0.3, // Temperature is lowered to reduce hallucinations
                maxOutputTokens: 800,
            },
        });
        // Call Gemini API Safely
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const responseText = response.text();

        if (!responseText) {
            throw new AppError('Empty response received from AI model.', 502);
        }

        return responseText;
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        if (error instanceof AppError) throw error;
        // For API Quota / Rate Limit / Network Failures
        throw new AppError(
            error.message || 'AI service is temporarily unavailable. Please try again shortly.',
            502
        );
    }
}