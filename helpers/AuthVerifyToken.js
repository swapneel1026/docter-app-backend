import { verifyToken } from "./authentication.js";

export function verifyCookie(cookieName) {
  return (req, res, next) => {
    const cookieToken = req.cookies[cookieName];
    if (!cookieToken) return next();
    try {
      const userPayload = verifyToken(cookieToken);
      req.user = userPayload;
    } catch (error) {
      return res.send(error);
    }
    return next();
  };
}
