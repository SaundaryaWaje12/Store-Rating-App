import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * @route   GET /api/ratings
 * @desc    Get all ratings
 * @access  Private (Admin only)
 */
router.get('/', async (req, res) => {
  // Check if admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  const db = req.app.locals.db;
  
  try {
    const [ratings] = await db.query(
      `SELECT r.id, r.rating, r.created_at as createdAt,
              u.name as userName, u.id as userId,
              s.name as storeName, s.id as storeId
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       JOIN stores s ON r.store_id = s.id
       ORDER BY r.created_at DESC`
    );
    
    res.json(ratings);
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/ratings/user
 * @desc    Get all ratings by current user
 * @access  Private
 */
router.get('/user', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const [ratings] = await db.query(
      `SELECT r.id, r.rating, r.store_id as storeId, 
              r.created_at as createdAt,
              s.name as storeName
       FROM ratings r
       JOIN stores s ON r.store_id = s.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    
    res.json(ratings);
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/ratings/store/:id
 * @desc    Get all ratings for a store
 * @access  Private
 */
router.get('/store/:id', async (req, res) => {
  const db = req.app.locals.db;
  const storeId = req.params.id;
  
  try {
    // Check if store exists
    const [stores] = await db.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check permission if store owner
    if (req.user.role === 'store_owner' && stores[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these ratings' });
    }

    const [ratings] = await db.query(
      `SELECT r.id, r.rating, r.created_at as createdAt,
              u.name as userName, u.id as userId
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    res.json(ratings);
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/ratings
 * @desc    Create or update a rating
 * @access  Private (Normal Users only)
 */
router.post('/', [
  body('storeId').notEmpty().withMessage('Store ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Only normal users can submit ratings
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only normal users can submit ratings' });
  }

  const { storeId, rating } = req.body;
  const userId = req.user.id;
  const db = req.app.locals.db;

  try {
    // Check if store exists
    const [stores] = await db.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already rated this store
    const [existingRatings] = await db.query(
      'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );
    
    if (existingRatings.length > 0) {
      // Update existing rating
      await db.query(
        'UPDATE ratings SET rating = ? WHERE id = ?',
        [rating, existingRatings[0].id]
      );
      
      res.json({
        id: existingRatings[0].id,
        rating,
        userId,
        storeId,
        message: 'Rating updated successfully'
      });
    } else {
      // Create new rating
      const [result] = await db.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
      
      res.status(201).json({
        id: result.insertId,
        rating,
        userId,
        storeId,
        message: 'Rating submitted successfully'
      });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/ratings/:id
 * @desc    Delete a rating
 * @access  Private (Admin or rating owner)
 */
router.delete('/:id', async (req, res) => {
  const ratingId = req.params.id;
  const db = req.app.locals.db;

  try {
    // Check if rating exists
    const [ratings] = await db.query('SELECT * FROM ratings WHERE id = ?', [ratingId]);
    
    if (ratings.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    
    const rating = ratings[0];
    
    // Check permission
    if (req.user.role !== 'admin' && rating.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }
    
    // Delete rating
    await db.query('DELETE FROM ratings WHERE id = ?', [ratingId]);
    
    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;