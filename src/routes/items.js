const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  // Get all items
  router.get('/', async (req, res, next) => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*');
      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  // Create item
  router.post('/', async (req, res, next) => {
    try {
      const { item } = req.body;
      const { data, error } = await supabase
        .from('items')
        .insert([item])
        .select();
      if (error) throw error;
      res.json(data[0]);
    } catch (error) {
      next(error);
    }
  });

  return router;
};
