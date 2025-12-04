const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const Buyer = require("../models/Buyer");
const config = require("../config/config");
const { asyncHandler } = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");


const protect = async (req, res, next) => {
  try {
    let token;

    //Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // check cookie
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError("Not authorized, no token", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    
    let user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      user = await Farmer.findById(decoded.id).select("-password");
    }
    
    if (!user) {
      user = await Buyer.findById(decoded.id).select("-password");
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!user.role) {
      if (user.constructor.modelName === 'Buyer') {
        user.role = 'buyer';
      } else if (user.constructor.modelName === 'Farmer') {
        user.role = 'farmer';
      }
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return next(new AppError("Not authorized, token failed or expired", 401));
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        `User role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};
    

const restrictTo = authorize;


const hasPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    if (
      req.user.role === "superadmin" ||
      (req.user.permissions && req.user.permissions.includes("admin:all"))
    ) {
      return next();
    }

    const hasRequiredPermission = permissions.some((permission) =>
      req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasRequiredPermission) {
      return next(
        new AppError("Insufficient permissions to access this route", 403)
      );
    }

    next();
  };
};


const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      
      // Try all three models
      let user = await User.findById(decoded.id).select("-password");
      if (!user) user = await Farmer.findById(decoded.id).select("-password");
      if (!user) user = await Buyer.findById(decoded.id).select("-password");

      if (user && user.isActive) {
        // Add role if not present
        if (!user.role) {
          if (user.constructor.modelName === 'Buyer') {
            user.role = 'buyer';
          } else if (user.constructor.modelName === 'Farmer') {
            user.role = 'farmer';
          }
        }
        
        req.user = user;
        
        // Update last activity if method exists
        if (typeof user.updateLastActivity === 'function') {
          user.updateLastActivity();
        }
      }
    } catch (error) {
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
});


//  VERIFY REFRESH TOKEN

const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError("Refresh token is required", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET);
    
    // Try all three models
    let user = await User.findById(decoded.id);
    if (!user) user = await Farmer.findById(decoded.id);
    if (!user) user = await Buyer.findById(decoded.id);

    if (!user) {
      return next(new AppError("Invalid refresh token", 401));
    }

    // Check if refresh token exists
    let tokenExists = false;
    if (user.refreshTokens) {
      tokenExists = user.refreshTokens.some((rt) => 
        typeof rt === 'string' ? rt === refreshToken : rt.token === refreshToken
      );
    }

    if (!tokenExists) {
      return next(new AppError("Invalid refresh token", 401));
    }

    if (user.isActive === false) {
      return next(new AppError("Your account has been deactivated", 401));
    }

    // Add role if not present
    if (!user.role) {
      if (user.constructor.modelName === 'Buyer') {
        user.role = 'buyer';
      } else if (user.constructor.modelName === 'Farmer') {
        user.role = 'farmer';
      }
    }

    req.user = user;
    req.refreshToken = refreshToken;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid refresh token", 401));
    } else if (error.name === "TokenExpiredError") {
      return next(new AppError("Refresh token expired", 401));
    }
    return next(new AppError("Invalid refresh token", 401));
  }
});


const checkOwnership = (resourceIdField = "id") => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params[resourceIdField];
    const userId = req.user.id;

    if (["admin", "superadmin"].includes(req.user.role)) {
      return next();
    }

    if (resourceId !== userId) {
      return next(new AppError("Not authorized to access this resource", 403));
    }

    next();
  });
};


const createRateLimit = (
  windowMs = config.RATE_LIMIT_WINDOW,
  max = config.RATE_LIMIT_MAX_REQUESTS
) => {
  const requests = new Map();

  return (req, res, next) => {
    const identifier = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    for (const [key, data] of requests.entries()) {
      if (data.resetTime < now) {
        requests.delete(key);
      }
    }

    let requestData = requests.get(identifier);

    if (!requestData || requestData.resetTime < now) {
      requestData = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    requestData.count++;
    requests.set(identifier, requestData);

    res.set({
      "X-RateLimit-Limit": max,
      "X-RateLimit-Remaining": Math.max(0, max - requestData.count),
      "X-RateLimit-Reset": new Date(requestData.resetTime).toISOString(),
    });

    if (requestData.count > max) {
      return next(
        new AppError("Too many requests, please try again later", 429)
      );
    }

    next();
  };
};


const validateApiKey = asyncHandler(async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return next(new AppError("API key is required", 401));
  }

  if (apiKey !== process.env.API_KEY) {
    return next(new AppError("Invalid API key", 401));
  }

  next();
});

module.exports = {
  protect,
  authorize,
  restrictTo,
  hasPermission,
  optionalAuth,
  verifyRefreshToken,
  checkOwnership,
  createRateLimit,
  validateApiKey,
};