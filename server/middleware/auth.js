const jwt = require('jsonwebtoken');

const JWT_SECRET = 'edushield_secret_key_2026';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name, studentId: user.studentId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify JWT and attach user to req
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Restrict to teacher role only
function teacherOnly(req, res, next) {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied. Teachers only.' });
  }
  next();
}

module.exports = { JWT_SECRET, generateToken, authenticate, teacherOnly };
