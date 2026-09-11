import { GoogleGenerativeAI } from "@google/generative-ai";
import Product from "../models/product.model";
import { AppError } from "../utils/error.utils";

// Candidate Gemini models ordered by preference
const CANDIDATE_MODELS = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro"
];

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
    try {
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
    } catch (dbError) {
        console.error('Database query error during RAG retrieval:', dbError);
        // Fail-safe fallback query
        return await Product.find({ stock: { $gt: 0 } })
            .select('name price processor ram storage screenSize ratings brand category stock')
            .populate('brand', 'name')
            .populate('category', 'name')
            .limit(8)
            .lean();
    }
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

    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = `
            You are the official AI Laptop Advisor for "LaptopVerse" e-commerce store.
            Your goal is to recommend the ideal laptop from our current in-stock catalog.

            Strict Rules:
            1. ONLY recommend laptops provided in the catalog context below. Never invent or hallucinate laptops.
            2. Respond in the exact same language as the user's prompt (e.g., if user asks in Myanmar language, respond in natural and clear Myanmar language; if in English, respond in English).
            3. Keep your answer concise, polite, and well-structured using Markdown formatting.
            4. Always highlight the Name, Specs, Price, and why it fits the user's specific request.
            5. If no exact fit exists in the provided catalog, suggest the closest available alternative from the catalog.

            Current Catalog Context:
            ${JSON.stringify(catalogContext, null, 2)}
            `;
    let lastError: any = null;

    // Production Fallback Loop: Try multiple model candidates sequentially
    for (const modelName of CANDIDATE_MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 2048,
                },
            });

            const result = await model.generateContent(userPrompt);
            const response = await result.response;
            const responseText = response.text();

            if (responseText && responseText.trim().length > 0) {
                return responseText;
            }
        } catch (error: any) {
            console.warn(`[Gemini Model Fallback] Model '${modelName}' failed, trying next candidate. Error:`, error.message || error);
            lastError = error;
        }
    }
    // Log detailed error for production monitoring
    console.error('All Gemini API model candidates failed:', lastError);

    throw new AppError(
        'AI service is temporarily unavailable. Please try again shortly.',
        502
    );
}