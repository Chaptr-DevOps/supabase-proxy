const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  // Sign Up
  router.post('/signup', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  // Sign In
  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  return router;
};