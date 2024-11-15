// src/routes/quiz.js
const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
    // Test endpoint to verify Supabase connection
    router.get('/test-connection', async (req, res, next) => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('count');

            res.json({
                connected: !error,
                error: error || null,
                supabaseUrl: process.env.SUPABASE_URL,
                // Don't log the full key, just the first few characters
                keyPreview: process.env.SUPABASE_ANON_KEY?.substring(0, 5) + '...'
            });
        } catch (error) {
            next(error);
        }
    });

    router.get('/questions/:id', async (req, res, next) => {
        try {
            console.log('Fetching question with ID:', req.params.id);

            // First, try to get just the question without joins
            const { data: questionData, error: questionError } = await supabase
                .from('questions')
                .select('*')
                .eq('id', req.params.id);

            console.log('Question query result:', {
                data: questionData,
                error: questionError
            });

            if (questionError) {
                throw questionError;
            }

            if (!questionData || questionData.length === 0) {
                return res.status(404).json({
                    error: 'Question not found',
                    details: 'No question found with the provided ID'
                });
            }

            // If we found the question, get its answers
            const { data: answersData, error: answersError } = await supabase
                .from('answers')
                .select('*')
                .eq('question_id', questionData[0].id);

            console.log('Answers query result:', {
                data: answersData,
                error: answersError
            });

            if (answersError) {
                throw answersError;
            }

            // Combine the data
            const result = {
                ...questionData[0],
                answers: answersData || []
            };

            res.json(result);
        } catch (error) {
            console.error('Full error object:', JSON.stringify(error, null, 2));
            next(error);
        }
    });

    router.get('/questions', async (req, res, next) => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log(data);
            res.json(data);
        } catch (error) {
            next(error);
        }
    });


    // Answers endpoints
    router.get('/answers', async (req, res, next) => {
        try {
            const { question_id } = req.query;
            let query = supabase.from('answers').select('*');

            if (question_id) {
                query = query.eq('question_id', question_id);
            }

            const { data, error } = await query;
            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    // Quiz attempts endpoints
    router.post('/quiz-attempts', async (req, res, next) => {
        try {
            const { user_id, start_time } = req.body;
            const { data, error } = await supabase
                .from('quiz_attempts')
                .insert([{ user_id, start_time }])
                .select()
                .single();
            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    router.patch('/quiz-attempts/:id', async (req, res, next) => {
        try {
            const { end_time, score } = req.body;
            const { data, error } = await supabase
                .from('quiz_attempts')
                .update({ end_time, score })
                .eq('id', req.params.id)
                .select()
                .single();
            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    // Quiz responses endpoints
    router.post('/quiz-responses', async (req, res, next) => {
        try {
            const { attempt_id, question_id, selected_answer_id } = req.body;
            const { data, error } = await supabase
                .from('quiz_responses')
                .insert([{
                    attempt_id,
                    question_id,
                    selected_answer_id
                }])
                .select()
                .single();
            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    router.get('/quiz-responses/:attempt_id', async (req, res, next) => {
        try {
            const { data, error } = await supabase
                .from('quiz_responses')
                .select(`
          *,
          question:questions(*),
          selected_answer:answers(*)
        `)
                .eq('attempt_id', req.params.attempt_id);
            if (error) throw error;
            res.json(data);
        } catch (error) {
            next(error);
        }
    });

    return router;
};