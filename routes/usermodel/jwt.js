import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // You need to install this: npm install bcryptjs --save

// JWT token service
class JsonWebToken {
    constructor() {
        this.key = 'BJ@zTF#%b%H!d^K@o4KsA*Eniaho9wgc!we^!ydL51fXZwdZpd!GxNZbTPyDLJi@l&&3OHzuLVEJcX9y8PpHMd5WgvCMbLsIioF7';
        this.error = null;
    }

    createToken(data, cron = 60*60*24*10) {
        const time = Math.floor(Date.now() / 1000);
        
        const token = {
            iat: time,
            exp: time + cron,
            data: data
        };
        // Specify HS256 algorithm explicitly to match PHP implementation
        return jwt.sign(token, this.key, { algorithm: 'HS256' });
    }

    getToken(jwtToken) {
        try {
            // Specify HS256 algorithm explicitly to match PHP implementation
            const decoded = jwt.verify(jwtToken, this.key, { algorithms: ['HS256'] });
            return decoded;
        } catch(error) {
            this.error = error;
            return false;
        }
    }

    getError() {
        return this.error;
    }

    getMessageError() {
        if (!this.error) return null;
        return this.error.message;
    }
}

// Authentication service that handles both JWT and password verification
class AuthService {
    constructor() {
        this.jwtService = new JsonWebToken();
    }

    // Create JWT token for authenticated user
    createUserToken(userData, expiration = 60*60*24*10) {
        // Remove sensitive data before creating token
        const userForToken = this.userForToken(userData);
        return this.jwtService.createToken(userForToken, expiration);
    }
    userForToken(userData) {
        // Remove sensitive data before creating token
        const userForToken = { ...userData };
        delete userForToken.claveUsuario; // Don't include password hash in token
        return userForToken;
    }
    // Verify password against bcrypt hash
    verifyPassword(plainPassword, hashedPassword) {
        try {
            // bcrypt.compare returns a Promise that resolves to boolean
            return bcrypt.compareSync(plainPassword, hashedPassword);
        } catch (error) {
            console.error("Password verification error:", error);
            return false;
        }
    }

    // Authenticate user with username/email and password
    async authenticateUser(user, plainPassword) {
        // Verify the password matches the stored hash
        const passwordValid = this.verifyPassword(plainPassword, user.claveUsuario);
        
        if (!passwordValid) {
            return { success: false, message: "Invalid password" };
        }
        
        // If password is valid, create a token
        const token = this.createUserToken(user);
        
        return {
            success: true,
            token,
            user: this.userForToken(user)
        };
    }

    // Verify a JWT token and return the user data
    verifyToken(token) {
        const decoded = this.jwtService.getToken(token);
        if (!decoded) {
            return { valid: false, message: this.jwtService.getMessageError() };
        }
        return { valid: true, userData: decoded.data };
    }
}

const authService = new AuthService();

export default authService;
