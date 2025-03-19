import type { TokenPayload } from "../config/jwt"

// Create a global type declaration file for Express
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}