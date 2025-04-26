import jwt from 'jsonwebtoken';

// Authenticate JWT middleware
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check if user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Check if user is a store owner
export const isStoreOwner = (req, res, next) => {
  if (req.user && req.user.role === 'store_owner') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Store Owner role required.' });
  }
};

// Check if user is either admin or the resource owner
export const isAdminOrSelf = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.id === parseInt(req.params.id))) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Access denied. You do not have permission to access this resource.' 
    });
  }
};