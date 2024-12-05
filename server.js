const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost/quiz_results', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define result schema
const resultSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    categoryScores: {
        interpersonalStyle: Number,
        flexibility: Number,
        interestBreadth: Number,
        openness: Number,
        selfAwareness: Number,
        beliefInCapability: Number,
        drive: Number,
        selfAdvocacy: Number,
        collaboration: Number,
        vulnerability: Number,
        playfulness: Number,
        selfEsteem: Number,
        perceptual: Number,
        relationships: Number,
        emotions: Number
    },
    leanScores: {
        type: Map,
        of: Number
    },
    finalVantiro: String,
    confidence: Number
});

const Result = mongoose.model('Result', resultSchema);

app.use(cors());
app.use(express.json());

// Endpoint to save results
app.post('/api/results', async (req, res) => {
    try {
        const result = new Result(req.body);
        await result.save();
        res.status(201).json({ message: 'Result saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving result' });
    }
});

// Endpoint to get all results
app.get('/api/results', async (req, res) => {
    try {
        const results = await Result.find().sort({ timestamp: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching results' });
    }
});