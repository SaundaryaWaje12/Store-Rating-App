import express from 'express';
import { isAdmin, isStoreOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats', isAdmin, async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    // Get user count
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Get store count
    const [storeCount] = await db.query('SELECT COUNT(*) as count FROM stores');
    
    // Get rating count
    const [ratingCount] = await db.query('SELECT COUNT(*) as count FROM ratings');
    
    res.json({
      userCount: userCount[0].count,
      storeCount: storeCount[0].count,
      ratingCount: ratingCount[0].count
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/dashboard/store
 * @desc    Get store owner dashboard statistics
 * @access  Private (Store Owner only)
 */
router.get('/store', isStoreOwner, async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    // Get store id
    const [stores] = await db.query(
      'SELECT id FROM stores WHERE user_id = ?',
      [req.user.id]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const storeId = stores[0].id;
    
    // Get rating count
    const [ratingCount] = await db.query(
      'SELECT COUNT(*) as count FROM ratings WHERE store_id = ?',
      [storeId]
    );
    
    // Get average rating
    const [avgRating] = await db.query(
      'SELECT AVG(rating) as avg FROM ratings WHERE store_id = ?',
      [storeId]
    );
    
    // Get rating distribution
    const [ratingDistribution] = await db.query(
      `SELECT rating, COUNT(*) as count 
       FROM ratings 
       WHERE store_id = ? 
       GROUP BY rating 
       ORDER BY rating DESC`,
      [storeId]
    );
    
    res.json({
      storeId,
      ratingCount: ratingCount[0].count,
      avgRating: avgRating[0].avg || 0,
      ratingDistribution
    });
  } catch (error) {
    console.error('Get store dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;