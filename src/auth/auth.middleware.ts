import { Injectable, NestMiddleware } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    async use(req: any, res: any, next: () => void) {
        if (req.url === 'signup' || req.url === 'login' || req.url === 'health' || req.url === 'setupPassword') {
            return next();
        }

        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
        }

        jwt.verify(token, 'secretKey', (err, decoded) => {
            if (err) {
              return res.status(401).json({ message: 'Unauthorized - Invalid token' });
            }
            // If the token is valid, you can attach user information to the request.
            // Example:
            req.user = decoded;
            next();
          });
    }
}