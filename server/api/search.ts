import { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method === "GET") {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: "Query parameter 'q' is required" });
        }

        // Replace with your search logic
        const result = { message: `Search results for '${query}'` };
        res.status(200).json(result);
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
