import { supabaseAdmin } from '../../supabaselogin/supabaseClient';
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    const { accessToken } = req.body;
    if (!accessToken) {
        return res.status(400).json({ message: 'Missing accessToken in request body' });
    }
    try {
        const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
        if (error || !data?.user) {
            return res.status(401).json({ message: 'Invalid or expired token', error });
        }
        return res.status(200).json({ user: data.user });
    }
    catch (err) {
        return res.status(500).json({ message: 'Internal server error', error: err });
    }
}
//# sourceMappingURL=verify-token.js.map