import { supabase } from '../supabaseClient.js'

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!"
            });
        }

        const token = authHeader.split(' ')[1];

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if(error || !user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized!" + error
            });
        }

        // writing back to request the user detail that we got
        req.user = user;

        // move to second function
        next();


    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error during auth"
        });
    }
}