import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("cc_token", token);
            // Optional: You could fetch user details here immediately if needed, 
            // but usually the Dashboard or a protected route wrapper does that.
            navigate("/dashboard");
        } else {
            console.error("No token received from Google Auth");
            navigate("/login");
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#070b18] flex items-center justify-center text-slate-900 dark:text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Authenticating with Google...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
