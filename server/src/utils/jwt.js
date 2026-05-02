import jwt from "jsonwebtoken";

export const signToken = (user) => {
  const { JWT_SECRET } = process.env;
  return jwt.sign(
    { id: user._id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  const { JWT_SECRET } = process.env;
  return jwt.verify(token, JWT_SECRET);
};
