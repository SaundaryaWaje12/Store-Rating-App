import express from 'express';
import { body, validationResult } from 'express-validator';
import { isAdmin, isStoreOwner } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/stores
 * @desc    Get all stores
 * @access  Private
 */
router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;
  
  try {
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.user_id as userId, 
             AVG(r.rating) as avgRating, s.created_at as createdAt
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;
    
    if (limit) {
      query += ' LIMIT ?';
    }
    
    const [stores] = limit 
      ? await db.query(query, [limit])
      : await db.query(query);
    
    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stores/me
 * @desc    Get store for current store owner
 * @access  Private (Store Owner only)
 */
router.get('/me', isStoreOwner, async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at as createdAt,
              AVG(r.rating) as avgRating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.user_id = ?
       GROUP BY s.id`,
      [req.user.id]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(stores[0]);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stores/ratings
 * @desc    Get ratings for current store owner's store
 * @access  Private (Store Owner only)
 */
router.get('/ratings', isStoreOwner, async (req, res) => {
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
    
    // Get ratings
    const [ratings] = await db.query(
      `SELECT r.id, r.rating, r.created_at as createdAt,
              u.name as userName, u.id as userId
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [storeId]
    );
    
    res.json({ storeId, ratings });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/stores/:id
 * @desc    Get store by ID
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  const db = req.app.locals.db;
  
  try {
    const [stores] = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.user_id as userId, 
              s.created_at as createdAt, AVG(r.rating) as avgRating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [req.params.id]
    );
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(stores[0]);
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/stores
 * @desc    Create new store
 * @access  Private (Admin only)
 */
router.post('/', [
  isAdmin,
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, address, userId } = req.body;
  const db = req.app.locals.db;

  try {
    // If userId provided, check if user exists and is a store owner
    if (userId) {
      const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (users[0].role !== 'store_owner') {
        // Update user to store owner
        await db.query('UPDATE users SET role = ? WHERE id = ?', ['store_owner', userId]);
      }
    }

    // Create store
    const [result] = await db.query(
      'INSERT INTO stores (name, email, address, user_id) VALUES (?, ?, ?, ?)',
      [name, email, address, userId || null]
    );

    const store = {
      id: result.insertId,
      name,
      email,
      address,
      userId: userId || null,
      avgRating: null,
      createdAt: new Date()
    };

    res.status(201).json(store);
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/stores/:id
 * @desc    Update store
 * @access  Private (Admin or Store Owner)
 */
router.put('/:id', [
  body('name').optional().isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('address').optional().isLength({ max: 400 }).withMessage('Address must not exceed 400 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, address } = req.body;
  const storeId = req.params.id;
  const db = req.app.locals.db;

  try {
    // Check if store exists
    const [stores] = await db.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    const store = stores[0];
    
    // Check permission
    if (req.user.role !== 'admin' && store.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this store' });
    }

    // Build update query
    let updateQuery = 'UPDATE stores SET';
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push(' name = ?');
      updateValues.push(name);
    }
    
    if (email !== undefined) {
      updateFields.push(' email = ?');
      updateValues.push(email);
    }
    
    if (address !== undefined) {
      updateFields.push(' address = ?');
      updateValues.push(address);
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    // Complete query
    updateQuery += updateFields.join(',');
    updateQuery += ' WHERE id = ?';
    updateValues.push(storeId);

    // Update store
    await db.query(updateQuery, updateValues);

    // Get updated store
    const [updatedStores] = await db.query(
      `SELECT s.id, s.name, s.email, s.address, s.user_id as userId, 
              s.created_at as createdAt, AVG(r.rating) as avgRating
       FROM stores s
       LEFT JOIN ratings r ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [storeId]
    );
    
    res.json(updatedStores[0]);
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/stores/:id
 * @desc    Delete store
 * @access  Private (Admin only)
 */
router.delete('/:id', isAdmin, async (req, res) => {
  const storeId = req.params.id;
  const db = req.app.locals.db;

  try {
    // Check if store exists
    const [stores] = await db.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    
    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Delete ratings for this store
    await db.query('DELETE FROM ratings WHERE store_id = ?', [storeId]);
    
    // Delete store
    await db.query('DELETE FROM stores WHERE id = ?', [storeId]);
    
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;