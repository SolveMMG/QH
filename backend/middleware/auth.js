
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is an employer
const isEmployer = (req, res, next) => {
  if (req.user && req.user.role?.toUpperCase() === 'EMPLOYER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Employer role required.' });
  }
};

// Middleware to check if user is a freelancer
const isFreelancer = (req, res, next) => {
  if (req.user && req.user.role === 'FREELANCER') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Freelancer role required.' });
  }
};

// Rate limiting middleware for applications
const applicationRateLimit = new Map();

const rateLimitApplications = (req, res, next) => {
  const freelancerId = req.user.id;
  const now = Date.now();
  
  // Get user's request history or initialize it
  const userHistory = applicationRateLimit.get(freelancerId) || [];
  
  // Filter requests made in the last hour
  const recentRequests = userHistory.filter(timestamp => now - timestamp < 3600000);
  
  // Allow up to 10 applications per hour
  if (recentRequests.length >= 10) {
    return res.status(429).json({ 
      message: 'Rate limit exceeded. You can apply to a maximum of 10 jobs per hour.'
    });
  }
  
  // Update the request history
  recentRequests.push(now);
  applicationRateLimit.set(freelancerId, recentRequests);
  
  next();
};

module.exports = {
  authenticateToken,
  isEmployer,
  isFreelancer,
  rateLimitApplications
};
