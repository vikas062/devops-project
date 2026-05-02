import { verifyToken } from "./jwt.js";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  console.log(`[AuthMiddleware] Header: ${header}`);
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    console.log("[AuthMiddleware] No token found");
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    req.user = verifyToken(token);
    console.log(`[AuthMiddleware] Authorized user: ${req.user.username}`);
    return next();
  } catch (error) {
    console.error(`[AuthMiddleware] Verification failed: ${error.message}`);
    return res.status(401).json({ message: "Invalid token" });
  }
};
