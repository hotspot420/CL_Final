let cards = {};
let questions = [];
let scores = {};
let categoryScores = {};
let leanScores = {};
let bestMatch = null;
let lowestDeviance = Infinity;

let totalQuestions = 70; // Total number of questions
let questionIndex = 0; // Start at 0 instead of 2
let currentQuestion = 0;

let answerHistory = [];

// New average ranges for each Vantiro
const vantiroRanges = {
    "Vantiro-1": {
        // Shishiq 5. Industrialists
        interpersonalStyle: { min: 3.5, max: 4.0 }, // More analytical
        flexibility: { min: 2.0, max: 2.5 }, // Somewhat rigid
        interestBreadth: { min: 1.5, max: 2.0 }, // Focused interests
        openness: { min: 2.0, max: 2.5 }, // More cautious
        selfAwareness: { min: 3.0, max: 3.5 }, // Moderate reflection
        beliefInCapability: { min: 3.5, max: 4.0 }, // Growth-oriented
        drive: { min: 4.5, max: 5.0 }, // Very goal-oriented
        selfAdvocacy: { min: 3.5, max: 4.0 }, // Moderately assertive
        collaboration: { min: 4.0, max: 4.5 }, // Cooperative
        vulnerability: { min: 2.0, max: 2.5 }, // More guarded
        playfulness: { min: 2.0, max: 2.5 }, // More serious
        selfEsteem: { min: 3.5, max: 4.0 }, // Confident
        perceptual: { min: 4.0, max: 4.5 }, // Intellectualizing
        relationships: { min: 3.0, max: 3.5 }, // Balanced
        emotions: { min: 2.0, max: 2.5 } // Less emotionally aware
    },
    "Vantiro-2": {
        // Shishiq 3. Gamblers
        interpersonalStyle: { min: 2.5, max: 3.0 }, // Balanced
        flexibility: { min: 4.0, max: 4.5 }, // Very adaptable
        interestBreadth: { min: 4.0, max: 4.5 }, // Broad interests
        openness: { min: 4.5, max: 5.0 }, // Very adventurous
        selfAwareness: { min: 3.0, max: 3.5 }, // Moderate reflection
        beliefInCapability: { min: 4.0, max: 4.5 }, // Strong growth mindset
        drive: { min: 3.0, max: 3.5 }, // Balanced
        selfAdvocacy: { min: 4.0, max: 4.5 }, // Assertive
        collaboration: { min: 3.5, max: 4.0 }, // Moderately cooperative
        vulnerability: { min: 3.5, max: 4.0 }, // Moderately open
        playfulness: { min: 4.5, max: 5.0 }, // Very playful
        selfEsteem: { min: 4.0, max: 4.5 }, // Confident
        perceptual: { min: 3.0, max: 3.5 }, // Balanced
        relationships: { min: 3.5, max: 4.0 }, // Moderately relational
        emotions: { min: 3.0, max: 3.5 } // Moderate awareness
    },
    "Vantiro-3": {
        interpersonalStyle: { min: 4.0, max: 4.5 }, // More empathetic
        flexibility: { min: 4.0, max: 4.5 }, // Very adaptable
        interestBreadth: { min: 3.0, max: 3.5 }, // Balanced
        openness: { min: 3.5, max: 4.0 }, // Moderately adventurous
        selfAwareness: { min: 4.0, max: 4.5 }, // High reflection
        beliefInCapability: { min: 3.5, max: 4.0 }, // Growth-oriented
        drive: { min: 2.5, max: 3.0 }, // More experience-oriented
        selfAdvocacy: { min: 3.0, max: 3.5 }, // Moderate
        collaboration: { min: 4.0, max: 4.5 }, // Cooperative
        vulnerability: { min: 4.0, max: 4.5 }, // Open
        playfulness: { min: 3.5, max: 4.0 }, // Moderately playful
        selfEsteem: { min: 3.0, max: 3.5 }, // Moderate
        perceptual: { min: 2.5, max: 3.0 }, // More sensory
        relationships: { min: 4.0, max: 4.5 }, // Highly relational
        emotions: { min: 4.0, max: 4.5 } // High awareness
    },
    "Vantiro-4": {
        // Shishiq 4. Strategists
        interpersonalStyle: { min: 4.5, max: 5.0 }, // Highly analytical
        flexibility: { min: 3.0, max: 3.5 }, // Moderate adaptability
        interestBreadth: { min: 3.0, max: 3.5 }, // Balanced interests
        openness: { min: 2.5, max: 3.0 }, // More cautious
        selfAwareness: { min: 4.0, max: 4.5 }, // High reflection
        beliefInCapability: { min: 3.5, max: 4.0 }, // Growth-oriented
        drive: { min: 4.5, max: 5.0 }, // Highly goal-oriented
        selfAdvocacy: { min: 3.5, max: 4.0 }, // Moderately assertive
        collaboration: { min: 3.0, max: 3.5 }, // Moderate
        vulnerability: { min: 2.0, max: 2.5 }, // Guarded
        playfulness: { min: 2.0, max: 2.5 }, // Serious
        selfEsteem: { min: 4.0, max: 4.5 }, // Confident
        perceptual: { min: 4.5, max: 5.0 }, // Highly intellectual
        relationships: { min: 2.5, max: 3.0 }, // More personal
        emotions: { min: 4.0, max: 4.5 } // High awareness
    },
    "Vantiro-5": {
        // Shishiq 3. Individualists
        interpersonalStyle: { min: 4.0, max: 4.5 }, // More analytical
        flexibility: { min: 1.5, max: 2.0 }, // Rigid
        interestBreadth: { min: 1.5, max: 2.0 }, // Focused
        openness: { min: 1.5, max: 2.0 }, // Very cautious
        selfAwareness: { min: 3.5, max: 4.0 }, // Good reflection
        beliefInCapability: { min: 2.0, max: 2.5 }, // Fixed mindset
        drive: { min: 3.5, max: 4.0 }, // Moderately goal-oriented
        selfAdvocacy: { min: 4.0, max: 4.5 }, // Assertive
        collaboration: { min: 1.5, max: 2.0 }, // Independent
        vulnerability: { min: 1.5, max: 2.0 }, // Very guarded
        playfulness: { min: 2.0, max: 2.5 }, // Serious
        selfEsteem: { min: 2.5, max: 3.0 }, // Moderate
        perceptual: { min: 4.0, max: 4.5 }, // Intellectual
        relationships: { min: 2.0, max: 2.5 }, // Personal
        emotions: { min: 2.0, max: 2.5 } // Low awareness
    },
    "Vantiro-6": {
        // Shishiq 3. Idealists
        interpersonalStyle: { min: 3.0, max: 3.5 }, // Balanced
        flexibility: { min: 3.0, max: 3.5 }, // Moderate
        interestBreadth: { min: 4.5, max: 5.0 }, // Very broad
        openness: { min: 4.0, max: 4.5 }, // Very open
        selfAwareness: { min: 4.0, max: 4.5 }, // High reflection
        beliefInCapability: { min: 4.0, max: 4.5 }, // Growth mindset
        drive: { min: 3.0, max: 3.5 }, // Balanced
        selfAdvocacy: { min: 2.5, max: 3.0 }, // Moderate
        collaboration: { min: 2.5, max: 3.0 }, // Moderate
        vulnerability: { min: 3.0, max: 3.5 }, // Moderate
        playfulness: { min: 3.5, max: 4.0 }, // Playful
        selfEsteem: { min: 3.0, max: 3.5 }, // Moderate
        perceptual: { min: 4.5, max: 5.0 }, // Highly intellectual
        relationships: { min: 2.5, max: 3.0 }, // More personal
        emotions: { min: 3.0, max: 3.5 } // Moderate awareness
    },
    "Vantiro-7": {
        // Shishiq 2. Investigators
        interpersonalStyle: { min: 3.5, max: 4.0 }, // Balanced-analytical
        flexibility: { min: 4.5, max: 5.0 }, // Highly adaptable
        interestBreadth: { min: 4.0, max: 4.5 }, // Broad
        openness: { min: 4.5, max: 5.0 }, // Very open
        selfAwareness: { min: 4.5, max: 5.0 }, // High reflection
        beliefInCapability: { min: 4.5, max: 5.0 }, // Strong growth mindset
        drive: { min: 3.5, max: 4.0 }, // Balanced-goal
        selfAdvocacy: { min: 4.0, max: 4.5 }, // Assertive
        collaboration: { min: 4.0, max: 4.5 }, // Cooperative
        vulnerability: { min: 3.5, max: 4.0 }, // Moderately open
        playfulness: { min: 3.5, max: 4.0 }, // Playful
        selfEsteem: { min: 4.0, max: 4.5 }, // Confident
        perceptual: { min: 3.5, max: 4.0 }, // Balanced
        relationships: { min: 4.5, max: 5.0 }, // Highly relational
        emotions: { min: 4.0, max: 4.5 } // High awareness
    },
    "Vantiro-8": {
        // Shishiq 2. Diplomats
        interpersonalStyle: { min: 4.5, max: 5.0 }, // Highly empathetic
        flexibility: { min: 4.0, max: 4.5 }, // Very adaptable
        interestBreadth: { min: 3.5, max: 4.0 }, // Moderately broad
        openness: { min: 3.5, max: 4.0 }, // Moderately open
        selfAwareness: { min: 4.5, max: 5.0 }, // High reflection
        beliefInCapability: { min: 3.5, max: 4.0 }, // Growth-oriented
        drive: { min: 3.0, max: 3.5 }, // Balanced
        selfAdvocacy: { min: 3.0, max: 3.5 }, // Moderate
        collaboration: { min: 4.5, max: 5.0 }, // Highly cooperative
        vulnerability: { min: 4.0, max: 4.5 }, // Open
        playfulness: { min: 3.0, max: 3.5 }, // Moderate
        selfEsteem: { min: 3.5, max: 4.0 }, // Moderately confident
        perceptual: { min: 3.0, max: 3.5 }, // Balanced
        relationships: { min: 4.5, max: 5.0 }, // Highly relational
        emotions: { min: 4.5, max: 5.0 } // High awareness
    },
    "Vantiro-9": {
        // Shishiq 1. Healers
        interpersonalStyle: { min: 4.5, max: 5.0 }, // Highly empathetic
        flexibility: { min: 3.5, max: 4.0 }, // Moderately adaptable
        interestBreadth: { min: 3.0, max: 3.5 }, // Balanced
        openness: { min: 3.5, max: 4.0 }, // Moderately open
        selfAwareness: { min: 4.5, max: 5.0 }, // High reflection
        beliefInCapability: { min: 4.0, max: 4.5 }, // Strong growth mindset
        drive: { min: 3.0, max: 3.5 }, // Balanced
        selfAdvocacy: { min: 2.5, max: 3.0 }, // Moderate
        collaboration: { min: 4.0, max: 4.5 }, // Cooperative
        vulnerability: { min: 4.5, max: 5.0 }, // Very open
        playfulness: { min: 3.5, max: 4.0 }, // Moderately playful
        selfEsteem: { min: 3.0, max: 3.5 }, // Moderate
        perceptual: { min: 2.5, max: 3.0 }, // More sensory
        relationships: { min: 4.5, max: 5.0 }, // Highly relational
        emotions: { min: 4.5, max: 5.0 } // High awareness
    },
    "Vantiro-10": {
        // Shishiq 1. Creators
        interpersonalStyle: { min: 3.0, max: 3.5 }, // Balanced
        flexibility: { min: 4.0, max: 4.5 }, // Very adaptable
        interestBreadth: { min: 4.5, max: 5.0 }, // Very broad
        openness: { min: 4.5, max: 5.0 }, // Very open
        selfAwareness: { min: 4.0, max: 4.5 }, // High reflection
        beliefInCapability: { min: 4.0, max: 4.5 }, // Strong growth mindset
        drive: { min: 3.5, max: 4.0 }, // Moderately goal-oriented
        selfAdvocacy: { min: 3.0, max: 3.5 }, // Moderate
        collaboration: { min: 3.5, max: 4.0 }, // Moderately cooperative
        vulnerability: { min: 3.5, max: 4.0 }, // Moderately open
        playfulness: { min: 4.5, max: 5.0 }, // Very playful
        selfEsteem: { min: 3.5, max: 4.0 }, // Moderately confident
        perceptual: { min: 3.5, max: 4.0 }, // Balanced-intellectual
        relationships: { min: 3.5, max: 4.0 }, // Moderately relational
        emotions: { min: 4.0, max: 4.5 } // High awareness
    },
    "Vantiro-11": {
        // Shishiq 4. Guardians
        interpersonalStyle: { min: 3.5, max: 4.0 }, // Moderately analytical
        flexibility: { min: 2.0, max: 2.5 }, // Somewhat rigid
        interestBreadth: { min: 2.5, max: 3.0 }, // Focused-balanced
        openness: { min: 2.0, max: 2.5 }, // Cautious
        selfAwareness: { min: 3.5, max: 4.0 }, // Good reflection
        beliefInCapability: { min: 3.0, max: 3.5 }, // Moderate growth
        drive: { min: 4.0, max: 4.5 }, // Goal-oriented
        selfAdvocacy: { min: 3.5, max: 4.0 }, // Moderately assertive
        collaboration: { min: 3.5, max: 4.0 }, // Moderately cooperative
        vulnerability: { min: 2.0, max: 2.5 }, // Guarded
        playfulness: { min: 2.5, max: 3.0 }, // More serious
        selfEsteem: { min: 3.5, max: 4.0 }, // Moderately confident
        perceptual: { min: 3.5, max: 4.0 }, // Balanced-intellectual
        relationships: { min: 3.0, max: 3.5 }, // Balanced
        emotions: { min: 3.0, max: 3.5 } // Moderate awareness
    },
    "Vantiro-12": {
        // Shishiq 5. Architects
        interpersonalStyle: { min: 4.0, max: 4.5 }, // More analytical
        flexibility: { min: 3.0, max: 3.5 }, // Moderate
        interestBreadth: { min: 3.5, max: 4.0 }, // Moderately broad
        openness: { min: 3.0, max: 3.5 }, // Moderate
        selfAwareness: { min: 4.0, max: 4.5 }, // High reflection
        beliefInCapability: { min: 4.0, max: 4.5 }, // Strong growth mindset
        drive: { min: 4.5, max: 5.0 }, // Highly goal-oriented
        selfAdvocacy: { min: 3.5, max: 4.0 }, // Moderately assertive
        collaboration: { min: 3.5, max: 4.0 }, // Moderately cooperative
        vulnerability: { min: 2.5, max: 3.0 }, // Moderate-guarded
        playfulness: { min: 2.5, max: 3.0 }, // More serious
        selfEsteem: { min: 3.5, max: 4.0 }, // Moderately confident
        perceptual: { min: 4.5, max: 5.0 }, // Highly intellectual
        relationships: { min: 3.0, max: 3.5 }, // Balanced
        emotions: { min: 3.5, max: 4.0 } // Moderate-high awareness
    }
};

// New data structures for player profiles
let playerProfile = {
    categories: {}, // Existing category scores
    leans: {}, // New lean scores
    expansion: { total: 0, count: 0, average: 0 },
    curiosity: { total: 0, count: 0, average: 0 },
    perspective: { total: 0, count: 0, average: 0 },
    judgment: { total: 0, count: 0, average: 0 },
    bravery: { total: 0, count: 0, average: 0 },
    perseverance: { total: 0, count: 0, average: 0 },
    learning: { total: 0, count: 0, average: 0 },
    curiosity: { total: 0, count: 0 },
    perspective: { total: 0, count: 0 },
    judgment: { total: 0, count: 0 },
    bravery: { total: 0, count: 0 },
    perseverance: { total: 0, count: 0 },
    learning: { total: 0, count: 0 },
    love: { total: 0, count: 0 },
    gratitude: { total: 0, count: 0 },
    humor: { total: 0, count: 0 },
    kindness: { total: 0, count: 0 }
    // Add other leans as needed
};

// Prompt data structure
class Prompt {
    constructor(id, content, trigger, flags, categoryRequirements, leanRequirements, bracket) {
        this.id = id;
        this.content = content;
        this.trigger = trigger; // e.g., 'random', 'bookcase', etc.
        this.flags = flags; // Array of required/excluding flags
        this.categoryRequirements = categoryRequirements; // Min/max for relevant categories
        this.leanRequirements = leanRequirements; // Min/max for relevant leans
        this.bracket = bracket; // 1, 2, or 3
    }
}

// Prompt Manager
class PromptManager {
    constructor() {
        this.prompts = new Map();
        this.triggerGroups = new Map();
        this.brackets = {
            LOW: { min: 0.0, max: 1.75 },
            MEDIUM: { min: 1.75, max: 3.75 },
            HIGH: { min: 3.75, max: 5.0 }
        };
    }

    calculatePromptMatch(prompt, playerProfile) {
        // Check flags first
        if (!this.checkFlags(prompt.flags, playerProfile.flags)) {
            return 0;
        }

        // Calculate category and lean score matches
        const categoryMatch = this.calculateCategoryMatch(prompt.categoryRequirements, playerProfile.categories);
        const leanMatch = this.calculateLeanMatch(prompt.leanRequirements, playerProfile.leans);
        
        // Calculate tension bonus
        const tensionBonus = this.calculateTensionBonus(prompt, playerProfile);
        
        // Apply challenge modifier if applicable
        const challengeModifier = playerProfile.challengeMarked ? 0.5 : 0;

        return categoryMatch + leanMatch + tensionBonus + challengeModifier;
    }

    getBracketedPrompts(trigger, playerProfile) {
        const availablePrompts = this.triggerGroups.get(trigger) || [];
        const bracketedPrompts = {
            1: [], 2: [], 3: []
        };

        availablePrompts.forEach(promptId => {
            const prompt = this.prompts.get(promptId);
            const matchScore = this.calculatePromptMatch(prompt, playerProfile);
            if (matchScore > 0) {
                bracketedPrompts[prompt.bracket].push({
                    prompt: prompt,
                    score: matchScore
                });
            }
        });

        return bracketedPrompts;
    }

    selectPrompt(trigger, playerProfile, preferredBracket = null) {
        const bracketedPrompts = this.getBracketedPrompts(trigger, playerProfile);
        let selectedBracket = preferredBracket || this.determineBracket(playerProfile);
        
        // If preferred bracket is empty, fall back to lower bracket
        while (selectedBracket > 1 && bracketedPrompts[selectedBracket].length === 0) {
            selectedBracket--;
        }

        if (bracketedPrompts[selectedBracket].length === 0) {
            return null;
        }

        // Sort by match score and randomly select from top 3
        const sortedPrompts = bracketedPrompts[selectedBracket]
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
            
        return sortedPrompts[Math.floor(Math.random() * sortedPrompts.length)].prompt;
    }

    checkFlags(promptFlags, playerFlags) {
        if (!promptFlags || promptFlags.length === 0) return true;
        
        for (const flag of promptFlags) {
            if (flag.startsWith('!')) {
                // Excluding flag - return false if player has this flag
                if (playerFlags.includes(flag.substring(1))) return false;
            } else {
                // Required flag - return false if player doesn't have this flag
                if (!playerFlags.includes(flag)) return false;
            }
        }
        return true;
    }

    calculateCategoryMatch(requirements, playerCategories) {
        if (!requirements) return 1.0;
        
        let totalDiff = 0;
        let count = 0;
        
        for (const [category, range] of Object.entries(requirements)) {
            const playerScore = playerCategories[category] || 0;
            if (playerScore < range.min) {
                totalDiff += range.min - playerScore;
            } else if (playerScore > range.max) {
                totalDiff += playerScore - range.max;
            }
            count++;
        }
        
        return count > 0 ? 1 - (totalDiff / count / 5) : 1;
    }

    calculateLeanMatch(requirements, playerLeans) {
        if (!requirements) return 1.0;
        
        let totalMatch = 0;
        let count = 0;
        
        for (const [lean, minScore] of Object.entries(requirements)) {
            const playerScore = playerLeans[lean] || 0;
            if (playerScore >= minScore) {
                totalMatch++;
            }
            count++;
        }
        
        return count > 0 ? totalMatch / count : 1;
    }

    calculateTensionBonus(prompt, playerProfile) {
        if (!prompt.categoryRequirements || !prompt.leanRequirements) return 0;
        
        let totalTension = 0;
        let count = 0;
        
        for (const category of Object.keys(prompt.categoryRequirements)) {
            for (const lean of Object.keys(prompt.leanRequirements)) {
                const categoryScore = playerProfile.categories[category] || 0;
                const leanScore = playerProfile.leans[lean] || 0;
                const tension = Math.abs(categoryScore - leanScore);
                
                if (tension >= 2) { // Significant tension threshold
                    totalTension += tension;
                    count++;
                }
            }
        }
        
        return count > 0 ? (totalTension / count) * 0.2 : 0; // 20% bonus max
    }

    determineBracket(playerProfile) {
        // Calculate average scores
        const categoryAvg = Object.values(playerProfile.categories)
            .reduce((sum, val) => sum + val, 0) / Object.keys(playerProfile.categories).length;
        
        const leanAvg = Object.values(playerProfile.leans)
            .reduce((sum, val) => sum + val, 0) / Object.keys(playerProfile.leans).length;
        
        const combinedScore = (categoryAvg + leanAvg) / 2;
        
        // Determine bracket based on combined score
        if (combinedScore >= this.brackets.HIGH.min) return 3;
        if (combinedScore >= this.brackets.MEDIUM.min) return 2;
        return 1;
    }
}

// Prompt deployment system
class PromptDeployment {
    constructor(promptManager) {
        this.promptManager = promptManager;
        this.activePrompts = new Map(); // tile -> prompt mapping
        this.groupVotes = new Map(); // prompt -> votes mapping
    }

    deployPromptForTile(tile, playerProfile) {
        const trigger = tile.triggerType;
        const prompt = this.promptManager.selectPrompt(trigger, playerProfile);
        
        if (prompt) {
            this.activePrompts.set(tile.id, prompt);
            return prompt;
        }
        return null;
    }

    voteToIncreaseBracket(promptId, playerId) {
        if (!this.groupVotes.has(promptId)) {
            this.groupVotes.set(promptId, new Set());
        }
        this.groupVotes.get(promptId).add(playerId);
    }

    checkBracketIncrease(promptId, totalPlayers) {
        const votes = this.groupVotes.get(promptId);
        return votes && votes.size === totalPlayers;
    }

    getPromptEffects(prompt) {
        return {
            lighting: this.calculateLightingEffects(prompt),
            sound: this.calculateSoundEffects(prompt),
            interaction: this.determineInteractionMode(prompt)
        };
    }

    calculateLightingEffects(prompt) {
        // Implementation for determining lighting effects based on prompt properties
        return {
            dimLevel: prompt.bracket >= 2 ? 0.5 : 1,
            color: prompt.properties?.color || 'neutral',
            animated: prompt.bracket === 3
        };
    }

    calculateSoundEffects(prompt) {
        // Implementation for determining sound effects based on prompt properties
        return {
            enabled: prompt.bracket >= 2,
            type: prompt.properties?.soundType || 'ambient',
            volume: prompt.bracket === 3 ? 1 : 0.5
        };
    }

    determineInteractionMode(prompt) {
        // Implementation for determining interaction mode based on prompt properties
        return {
            type: prompt.properties?.interactionType || 'solo',
            collaborative: prompt.bracket === 3,
            duration: prompt.properties?.duration || 60
        };
    }
}

// Remove the duplicate initializeQuiz function and consolidate initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize scores objects
    const categories = ['interpersonalStyle', 'flexibility', 'interestBreadth', 'openness', 
                       'selfAwareness', 'beliefInCapability', 'drive', 'selfAdvocacy', 
                       'collaboration', 'vulnerability', 'playfulness', 'selfEsteem',
                       'perceptual', 'relationships', 'emotions'];
    
    categories.forEach(category => {
        if (!scores[category]) {  // Only initialize if not already set
            scores[category] = { total: 0, count: 0 };
        }
    });

    const leans = ['appreciationOfBeauty', 'bravery', 'creativity', 'curiosity', 'fairness',
                  'forgiveness', 'gratitude', 'honesty', 'hope', 'humility', 'humor',
                  'judgment', 'kindness', 'leadership', 'love', 'loveOfLearning',
                  'perseverance', 'perspective', 'prudence', 'selfRegulation',
                  'socialIntelligence', 'spirituality', 'teamwork', 'zest'];
    
    leans.forEach(lean => {
        if (!leanScores[lean]) {  // Only initialize if not already set
            leanScores[lean] = { total: 0, count: 0 };
        }
    });

    // Load both cards and questions
    Promise.all([
        fetch('cards.json').then(response => response.json()),
        fetch('questions.json').then(response => response.json())
    ]).then(([cardsData, questionsData]) => {
        cards = cardsData;
        questions = optimizeQuestionOrder(questionsData);
        
        // Debug logging
        console.log("Total questions loaded:", questions.length);
        console.log("First question:", questions[0]);
        console.log("Last question:", questions[questions.length - 1]);
        console.log("Question 40:", questions[39]);
        console.log("Question 41:", questions[40]);
        
        displayQuestion(currentQuestion);
    }).catch(error => {
        console.error('Error loading data:', error);
        document.getElementById('question-container').innerHTML = 
            '<p class="error-message">Error loading questions. Please refresh the page.</p>';
    });

    // Set up button handlers
    document.getElementById('next-button').onclick = function() {
        const slider = document.querySelector('.quiz-slider');
        if (slider) {
            const value = parseFloat(slider.value);
            recordAnswer(value, currentQuestion);
        }
        
        if (currentQuestion >= questions.length - 1) {
            displayResult();
        } else {
            currentQuestion++;
            displayQuestion(currentQuestion);
        }
    };

    document.getElementById('back-button').onclick = function() {
        if (currentQuestion > 0) {
            answerHistory.pop();
            currentQuestion--;
            displayQuestion(currentQuestion);
        }
    };

    document.getElementById('see-results-button').onclick = function() {
        console.log("=== See Results Button Clicked ===");
        console.log("Current scores state:", scores);
        
        if (confirm('Are you sure you want to see your results now? Continuing the quiz will provide more accurate results.')) {
            console.log("User confirmed - proceeding to display results");
            displayResult();
        } else {
            console.log("User cancelled - continuing quiz");
        }
    };
});

// Update displayQuestion function
function displayQuestion(index) {
    if (!questions || !questions.length) {
        console.error('Questions not loaded');
        return;
    }

    const question = questions[index];
    if (!question) {
        console.error('Invalid question index:', index);
        return;
    }

    console.log(`Displaying question ${index + 1}:`, {
        id: question.id,
        question: question.question,
        categories: question.category,
        leans: question.lean
    });

    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = `
        <p class="question-text">${question.question}</p>
        <div class="slider-container">
            <input type="range" min="1" max="5" step="1" value="3" class="quiz-slider" id="question-slider">
            <div class="slider-labels">
                <div class="slider-label">Strongly Disagree</div>
                <div class="slider-label">Disagree</div>
                <div class="slider-label">Neutral</div>
                <div class="slider-label">Agree</div>
                <div class="slider-label">Strongly Agree</div>
            </div>
        </div>
    `;

    const slider = document.getElementById('question-slider');
    if (slider) {
        // Only set a previous value if we're going backwards
        if (answerHistory[index]) {
            slider.value = answerHistory[index].value;
        } else {
            slider.value = "3"; // Force neutral start for new questions
        }
        
        slider.addEventListener('input', function() {
            const value = Math.round(this.value);
            this.value = value;
        });
    }

    // Update progress and button visibility
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const nextButton = document.getElementById('next-button');
    const backButton = document.getElementById('back-button');
    const seeResultsButton = document.getElementById('see-results-button');
    
    if (progressBar && progressText) {
        progressBar.value = index + 1;
        progressText.textContent = `${index + 1}/70`;
        
        // Show results button after 24 questions but keep next button visible
        if (index >= 23) {
            progressBar.classList.remove('incomplete');
            progressBar.classList.add('complete');
            seeResultsButton.style.display = 'block';
        } else {
            progressBar.classList.remove('complete');
            progressBar.classList.add('incomplete');
            seeResultsButton.style.display = 'none';
        }
    }

    // Keep next button visible until the very last question
    nextButton.style.display = index >= questions.length - 1 ? 'none' : 'block';
    backButton.disabled = index === 0;
}

// Update this constant based on the analysis results
let MINIMUM_QUESTIONS = 15; // Default starting value

// Update the progress bar logic
function updateProgress(questionIndex) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    progressBar.value = questionIndex;
    progressText.textContent = `${questionIndex}/${totalQuestions}`;
    
    if (questionIndex >= MINIMUM_QUESTIONS) {
        progressBar.classList.remove('incomplete');
        progressBar.classList.add('complete');
        document.getElementById('see-results-button').style.display = 'block';
    } else {
        progressBar.classList.remove('complete');
        progressBar.classList.add('incomplete');
        document.getElementById('see-results-button').style.display = 'none';
    }
}

function calculateScores() {
    // Use calculateResults instead of the current logic
    return calculateResults(answerHistory);
}

function findBestVantiroMatch(categoryAverages) {
    let bestMatch = null;
    let lowestDeviance = Infinity;
    let totalPossibleDeviance = 0;  // Maximum possible deviance

    for (const [vantiroType, ranges] of Object.entries(vantiroRanges)) {
        let totalDeviance = 0;
        let validRanges = 0;

        for (const [category, range] of Object.entries(ranges)) {
            if (categoryAverages[category]) {
                const score = categoryAverages[category];
                const midpoint = (range.min + range.max) / 2;
                const maxPossibleDeviance = Math.max(
                    Math.abs(5 - midpoint),  // Maximum possible distance above
                    Math.abs(1 - midpoint)   // Maximum possible distance below
                );
                totalPossibleDeviance += maxPossibleDeviance;

                if (score < range.min) {
                    totalDeviance += range.min - score;
                } else if (score > range.max) {
                    totalDeviance += score - range.max;
                }
                validRanges++;
            }
        }

        const avgDeviance = validRanges > 0 ? totalDeviance / validRanges : Infinity;
        
        if (avgDeviance < lowestDeviance) {
            lowestDeviance = avgDeviance;
            bestMatch = vantiroType;
        }
    }

    // Calculate confidence as a percentage, where 0 deviance = 100% confidence
    const confidence = Math.max(0, Math.min(100, 
        (1 - (lowestDeviance / (totalPossibleDeviance / Object.keys(categoryAverages).length))) * 100
    ));

    return { 
        type: bestMatch, 
        deviance: lowestDeviance,
        confidence: confidence 
    };
}

function displayResult() {
    console.log("=== Starting displayResult ===");
    
    const averages = calculateScores();
    console.log("Calculated averages:", averages);
    
    const matchResult = findBestVantiroMatch(averages.categories);
    console.log("Match result:", matchResult);

    if (!matchResult || !matchResult.type) {
        console.error("No valid Vantiro match found");
        document.getElementById('result-section').innerHTML = `
            <h3>Unable to determine Vantiro type</h3>
            <p>Please try answering more questions for a more accurate result.</p>
        `;
        return;
    }

    // Hide quiz section
    document.querySelector('.question-section').style.display = 'none';
    
    // Extract the Vantiro number from the type (e.g., "Vantiro-6" -> 6)
    const vantiroNumber = parseInt(matchResult.type.split('-')[1]);
    
    // Create the results HTML first
    const resultSection = document.getElementById('result-section');
    resultSection.innerHTML = `
        <div class="results-container">
            <div class="results-text">
                <h3>You Are: ${matchResult.type}</h3>
                <p class="confidence">Confidence: ${(100 - matchResult.deviance * 100).toFixed(1)}%</p>
                <p class="type-description">${cards[matchResult.type]?.description || 'Description not available.'}</p>
            </div>
            <div class="results-image">
                <img id="gallery-img" src="" alt="Vantiro Type Illustration">
            </div>
        </div>
        <div class="visualization-container">
            <div id="p5-canvas"></div>
            <div class="shishiq-info">
                <h3>Shishiq Analysis</h3>
                <p>${cards[matchResult.type]?.shishiq || 'Shishiq information not available.'}</p>
            </div>
        </div>
    `;
    
    resultSection.style.display = 'block';

    // Try to load gallery images
    try {
        loadGalleryImages(matchResult.type);
    } catch (err) {
        console.error("Error loading gallery images:", err);
    }

    // Simple p5 sketch that draws circles based on Vantiro number
    const sketch = (p) => {
        p.setup = () => {
            const canvas = p.createCanvas(800, 400);
            canvas.parent('p5-canvas');
            p.background(240);  // Light gray background
            p.noLoop();  // We only need to draw once
        };

        p.draw = () => {
            p.background(240);
            p.fill(100);  // Gray circles
            p.noStroke();
            
            const diameter = 40;
            const spacing = 60;
            const startX = (p.width - (vantiroNumber * spacing - (spacing - diameter))) / 2;
            const y = p.height / 2;
            
            // Draw circles equal to the Vantiro number
            for (let i = 0; i < vantiroNumber; i++) {
                p.circle(startX + (i * spacing), y, diameter);
            }
        };
    };

    // Create new p5 instance
    new p5(sketch);
}

function getRandomImage(vantiro) {
    return fetch(`${vantiro}/list.json`) // Load the specific JSON file
        .then(response => response.json()) // Parse the JSON
        .then(images => {
            const randomIndex = Math.floor(Math.random() * images.length); // Get a random index
            const imagePath = `${vantiro}/${images[randomIndex]}`; // Construct the image path
            console.log("Generated Image Path:", imagePath); // Log for debugging
            return imagePath; // Return the image path
        });
}

function loadGalleryImages(bestMatch) {
    fetch(`${bestMatch}/list.json`)
        .then(response => response.json())
        .then(images => {
            const randomIndex = Math.floor(Math.random() * images.length);
            const galleryImage = `${bestMatch}/${images[randomIndex]}`;
            document.getElementById('gallery-img').src = galleryImage; // Set gallery image
        })
        .catch(error => {
            console.error("Error fetching gallery images:", error);
        });
}

// New function to evaluate challenge marking
function evaluateChallengeMarking() {
    const challengeLeans = ['bravery', 'curiosity', 'perseverance', 'learning'];
    let highScoreCount = 0;
    
    challengeLeans.forEach(lean => {
        const score = leanScores[lean].total / leanScores[lean].count;
        if (score >= 4.0) highScoreCount++;
    });
    
    playerProfile.challengeMarked = highScoreCount >= 2;
}

// New function to calculate tensions
function calculateTensions(categoryScores, leanScores) {
    let tensions = {};
    
    for (const category in categoryScores) {
        for (const lean in leanScores) {
            const tensionKey = `${category}-${lean}`;
            tensions[tensionKey] = Math.abs(categoryScores[category] - leanScores[lean]);
        }
    }
    
    return tensions;
}

function calculateScores() {
    let categoryAverages = {};
    let leanAverages = {};

    // Calculate category averages
    for (const category in scores) {
        if (scores[category].count > 0) {
            categoryAverages[category] = scores[category].total / scores[category].count;
        }
    }

    // Calculate lean averages
    for (const lean in leanScores) {
        if (leanScores[lean].count > 0) {
            leanAverages[lean] = leanScores[lean].total / leanScores[lean].count;
        }
    }

    // Log raw scores for debugging
    console.log('Raw Category Scores:', scores);
    console.log('Raw Lean Scores:', leanScores);
    
    return {
        categories: categoryAverages,
        leans: leanAverages
    };
}

// Add a function to verify lean distribution
function analyzeLeanDistribution() {
    let leanCounts = {};
    questions.forEach(question => {
        if (Array.isArray(question.lean)) {
            question.lean.forEach(lean => {
                leanCounts[lean] = (leanCounts[lean] || 0) + 1;
            });
        }
    });
    console.log('Lean Distribution:', leanCounts);
}

// Add a function to verify category distribution
function analyzeCategoryDistribution() {
    let categoryCounts = {};
    questions.forEach(question => {
        if (Array.isArray(question.category)) {
            question.category.forEach(category => {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
        }
    });
    console.log('Category Distribution:', categoryCounts);
}

function visualizeDistribution() {
    const leanCounts = {};
    const categoryCounts = {};
    
    // Count occurrences
    questions.forEach(question => {
        // Count leans
        if (Array.isArray(question.lean)) {
            question.lean.forEach(lean => {
                leanCounts[lean] = (leanCounts[lean] || 0) + 1;
            });
        }
        
        // Count categories
        if (Array.isArray(question.category)) {
            question.category.forEach(category => {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
        }
    });

    // Create visual bars for categories
    console.log('\n=== Category Distribution ===');
    Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
            const percentage = (count / questions.length * 100).toFixed(1);
            const bar = '█'.repeat(Math.round(percentage / 2));
            console.log(`${category.padEnd(20)} ${bar} (${count} questions, ${percentage}%)`);
        });

    // Create visual bars for leans
    console.log('\n=== Lean Distribution ===');
    Object.entries(leanCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([lean, count]) => {
            const percentage = (count / questions.length * 100).toFixed(1);
            const bar = '█'.repeat(Math.round(percentage / 2));
            console.log(`${lean.padEnd(20)} ${bar} (${count} questions, ${percentage}%)`);
        });

    // Summary statistics
    console.log('\n=== Summary ===');
    console.log(`Total Questions: ${questions.length}`);
    console.log(`Total Categories: ${Object.keys(categoryCounts).length}`);
    console.log(`Total Leans: ${Object.keys(leanCounts).length}`);
    console.log(`Average questions per category: ${(questions.length / Object.keys(categoryCounts).length).toFixed(1)}`);
    console.log(`Average questions per lean: ${(questions.length / Object.keys(leanCounts).length).toFixed(1)}`);
}

// Update the fetch call to include visualization
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = data;
        visualizeDistribution();
        displayQuestion(currentQuestion);
    })
    .catch(error => console.error('Error loading questions:', error));

function goBack() {
    if (currentQuestion > 0) {
        // Remove the last answer from history
        const lastAnswer = answerHistory.pop();
        
        // Subtract the last answer from the scores
        if (lastAnswer) {
            const question = questions[currentQuestion - 1];
            question.category.forEach(cat => {
                scores[cat].total -= lastAnswer;
                scores[cat].count--;
            });
            if (question.lean) {
                question.lean.forEach(l => {
                    leanScores[l].total -= lastAnswer;
                    leanScores[l].count--;
                });
            }
        }
        
        currentQuestion--;
        displayQuestion(currentQuestion);
    }
}

// Add event listener for back button
document.getElementById('back-button').addEventListener('click', goBack);

// Modify the next button handler to save answers to history
document.getElementById('next-button').onclick = function() {
    const slider = document.querySelector('.quiz-slider');
    if (slider) {
        const value = parseFloat(slider.value);
        recordAnswer(value, currentQuestion);
        answerHistory.push(value);
    }
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion(currentQuestion);
    } else {
        displayResult();
    }
};

function optimizeQuestionOrder(questions) {
    console.log("Starting question optimization with", questions.length, "questions");
    
    // Create a working copy of questions
    let workingQuestions = [...questions];
    let optimizedOrder = [];
    
    // First, identify questions that cover our missing categories and leans
    const criticalQuestions = workingQuestions.filter(q => {
        const hasCriticalCategory = q.category.some(cat => 
            ['emotions', 'perceptual'].includes(cat));
        const hasCriticalLean = Array.isArray(q.lean) && q.lean.some(lean => 
            ['bravery', 'creativity', 'gratitude', 'hope', 'kindness', 
             'leadership', 'perseverance', 'spirituality'].includes(lean));
        return hasCriticalCategory || hasCriticalLean;
    });

    // Remove critical questions from working set
    workingQuestions = workingQuestions.filter(q => 
        !criticalQuestions.some(cq => cq.id === q.id));

    // Sort critical questions by coverage score
    criticalQuestions.sort((a, b) => getCriticalScore(b) - getCriticalScore(a));

    // Take first 12 critical questions
    const selectedCritical = criticalQuestions.slice(0, 12);
    const remainingCritical = criticalQuestions.slice(12);
    
    // Interleave critical and regular questions for first 24
    for (let i = 0; i < 24; i++) {
        if (i % 2 === 0 && selectedCritical.length > 0) {
            optimizedOrder.push(selectedCritical.shift());
        } else if (workingQuestions.length > 0) {
            optimizedOrder.push(workingQuestions.shift());
        }
    }

    // Add ALL remaining questions
    optimizedOrder = [
        ...optimizedOrder,
        ...selectedCritical,
        ...remainingCritical,
        ...workingQuestions
    ];

    console.log("Optimization complete. Final question count:", optimizedOrder.length);
    
    // Verify we haven't lost any questions
    if (optimizedOrder.length !== questions.length) {
        console.error(`Question count mismatch! Started with ${questions.length}, ended with ${optimizedOrder.length}`);
    }

    return optimizedOrder;
}

function getCriticalScore(question) {
    let score = 0;
    
    // Count critical categories
    question.category.forEach(cat => {
        if (['emotions', 'perceptual'].includes(cat)) score += 2;
    });
    
    // Count critical leans
    if (Array.isArray(question.lean)) {
        question.lean.forEach(lean => {
            if (['bravery', 'creativity', 'gratitude', 'hope', 'kindness', 
                 'leadership', 'perseverance', 'spirituality'].includes(lean)) {
                score += 1.5;
            }
        });
    }
    
    return score;
}

function optimizeRemainingQuestions(questions) {
    // Previous optimization logic here
    return questions;
}

// Apply the optimization when loading questions
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = optimizeQuestionOrder(data);
        
        // Calculate minimum questions needed right after optimization
        const minQuestions = analyzeMinimumQuestions(questions);
        console.log(`Minimum questions needed for full coverage: ${minQuestions}`);
        
        // Update the global minimum questions value
        MINIMUM_QUESTIONS = minQuestions;
        
        // Continue with visualization and display
        visualizeDistribution();
        displayQuestion(currentQuestion);
    })
    .catch(error => {
        console.error('Error loading questions:', error);
        // Use default value if there's an error
        MINIMUM_QUESTIONS = 15;
    });

function analyzeMinimumQuestions(questions) {
    if (!questions || !Array.isArray(questions)) {
        console.error("No valid questions array provided to analyzeMinimumQuestions");
        return 15; // Return default value if questions aren't loaded
    }
    
    let seenCategories = new Set();
    let seenLeans = new Set();
    let minimumNeeded = 0;
    
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let hadNew = false;
        
        q.category.forEach(cat => {
            if (!seenCategories.has(cat)) {
                seenCategories.add(cat);
                hadNew = true;
            }
        });
        
        if (Array.isArray(q.lean)) {
            q.lean.forEach(lean => {
                if (!seenLeans.has(lean)) {
                    seenLeans.add(lean);
                    hadNew = true;
                }
            });
        }
        
        if (hadNew) {
            minimumNeeded = i + 1;
        }
        
        console.log(`After question ${i + 1}:`);
        console.log(`Categories covered: ${seenCategories.size}/15`);
        console.log(`Leans covered: ${seenLeans.size}/24`);
    }
    
    return minimumNeeded;
}

// Add this function near the top of script.js with other function definitions
function updateVisualScores(averages) {
    if (!averages || !averages.categories) return;
    
    // Update visualization flags based on scores
    visualLocRel = averages.categories.relationships > 3.5;
    visualLocObj = averages.categories.perceptual > 3.5;
    visualOrg = averages.categories.flexibility > 3.5;
    visualCircuit = averages.categories.interpersonalStyle > 3.5;
    visualSharedMem = averages.categories.selfAwareness > 3.5;
    visualSharedInt = averages.categories.beliefInCapability > 3.5;
    visualSharedExp = averages.categories.openness > 3.5;
    visualSharedCause = averages.categories.drive > 3.5;
}

function analyzeCoverage(questions, startIndex, endIndex) {
    let seenCategories = new Set();
    let seenLeans = new Set();
    
    for (let i = startIndex; i < endIndex && i < questions.length; i++) {
        const q = questions[i];
        q.category.forEach(cat => seenCategories.add(cat));
        if (Array.isArray(q.lean)) {
            q.lean.forEach(lean => seenLeans.add(lean));
        }
    }
    
    console.log(`\nCoverage Analysis (Questions ${startIndex + 1}-${endIndex}):`);
    console.log(`Categories covered: ${seenCategories.size}/15`);
    console.log('Missing categories:', 
        ['interpersonalStyle', 'flexibility', 'interestBreadth', 'openness', 
         'selfAwareness', 'beliefInCapability', 'drive', 'selfAdvocacy', 
         'collaboration', 'vulnerability', 'playfulness', 'selfEsteem',
         'perceptual', 'relationships', 'emotions']
        .filter(cat => !seenCategories.has(cat)));
    
    console.log(`\nLeans covered: ${seenLeans.size}/24`);
    console.log('Missing leans:', 
        ['appreciationOfBeauty', 'bravery', 'creativity', 'curiosity', 'fairness',
         'forgiveness', 'gratitude', 'honesty', 'hope', 'humility', 'humor',
         'judgment', 'kindness', 'leadership', 'love', 'loveOfLearning',
         'perseverance', 'perspective', 'prudence', 'selfRegulation',
         'socialIntelligence', 'spirituality', 'teamwork', 'zest']
        .filter(lean => !seenLeans.has(lean)));
}

// Add this to your fetch callback
fetch('questions.json')
    .then(response => response.json())
    .then(data => {
        questions = optimizeQuestionOrder(data);
        analyzeCoverage(questions, 0, 24); // Analyze first 24 questions
        visualizeDistribution();
        displayQuestion(currentQuestion);
    });

function calculateResults(answers) {
    console.log("Starting calculateResults with answers:", answers);
    console.log("Total questions available:", questions.length);

    // Initialize tracking objects
    const categoryTotals = {};
    const leanTotals = {};
    let processedAnswers = 0;
    
    // Log the first few questions for debugging
    console.log("First 5 questions structure:", questions.slice(0, 5));

    // Process answers
    answers.forEach((answer, index) => {
        const question = questions[index];
        console.log(`\nProcessing answer ${index + 1}:`, answer);
        console.log("Question:", question?.question);
        console.log("Categories:", question?.category);
        console.log("Leans:", question?.lean);

        if (answer !== null && answer !== undefined) {
            processedAnswers++;
            
            // Process categories
            question.category.forEach(cat => {
                if (!categoryTotals[cat]) {
                    categoryTotals[cat] = { total: 0, count: 0 };
                }
                categoryTotals[cat].total += answer;
                categoryTotals[cat].count++;
                console.log(`Updated ${cat}: total=${categoryTotals[cat].total}, count=${categoryTotals[cat].count}`);
            });
            
            // Process leans
            if (Array.isArray(question.lean)) {
                question.lean.forEach(lean => {
                    if (!leanTotals[lean]) {
                        leanTotals[lean] = { total: 0, count: 0 };
                    }
                    leanTotals[lean].total += answer;
                    leanTotals[lean].count++;
                    console.log(`Updated ${lean}: total=${leanTotals[lean].total}, count=${leanTotals[lean].count}`);
                });
            }
        } else {
            console.log("Skipping null/undefined answer");
        }
    });

    console.log(`\nProcessed ${processedAnswers} answers out of ${answers.length} total`);
    console.log("Final Category Totals:", categoryTotals);
    console.log("Final Lean Totals:", leanTotals);

    // Calculate final averages
    const finalScores = {};
    
    // Calculate category averages
    Object.entries(categoryTotals).forEach(([category, data]) => {
        finalScores[category] = data.count > 0 ? data.total / data.count : 0;
    });
    
    // Calculate lean averages
    Object.entries(leanTotals).forEach(([lean, data]) => {
        finalScores[lean] = data.count > 0 ? data.total / data.count : 0;
    });

    console.log("Final calculated scores:", finalScores);
    return finalScores;
}

function initializeScores() {
    // Only initialize if not already initialized
    if (Object.keys(scores).length === 0) {
        const categories = [
            'interpersonalStyle', 'flexibility', 'interestBreadth', 'openness', 
            'selfAwareness', 'beliefInCapability', 'drive', 'selfAdvocacy', 
            'collaboration', 'vulnerability', 'playfulness', 'selfEsteem',
            'perceptual', 'relationships', 'emotions'
        ];
        
        categories.forEach(category => {
            scores[category] = { total: 0, count: 0 };
        });
    }

    if (Object.keys(leanScores).length === 0) {
        const leans = [
            'appreciationOfBeauty', 'bravery', 'creativity', 'curiosity', 'fairness',
            'forgiveness', 'gratitude', 'honesty', 'hope', 'humility', 'humor',
            'judgment', 'kindness', 'leadership', 'love', 'loveOfLearning',
            'perseverance', 'perspective', 'prudence', 'selfRegulation',
            'socialIntelligence', 'spirituality', 'teamwork', 'zest'
        ];
        
        leans.forEach(lean => {
            leanScores[lean] = { total: 0, count: 0 };
        });
    }
}

function recordAnswer(value, questionIndex) {
    // Ensure scores are initialized
    initializeScores();
    
    // Validate the value
    if (isNaN(value) || value === null || value === undefined) {
        console.warn(`Invalid answer value for question ${questionIndex}: ${value}`);
        return;
    }
    
    const question = questions[questionIndex];
    if (!question) {
        console.error(`No question found at index ${questionIndex}`);
        return;
    }
    
    // Record category scores
    if (Array.isArray(question.category)) {
        question.category.forEach(category => {
            if (!scores[category]) {
                scores[category] = { total: 0, count: 0 };
            }
            scores[category].total = (scores[category].total || 0) + parseFloat(value);
            scores[category].count++;
        });
    }

    // Record lean scores
    if (Array.isArray(question.lean)) {
        question.lean.forEach(lean => {
            if (!leanScores[lean]) {
                leanScores[lean] = { total: 0, count: 0 };
            }
            leanScores[lean].total = (leanScores[lean].total || 0) + parseFloat(value);
            leanScores[lean].count++;
        });
    }

    // Store answer in history
    answerHistory[questionIndex] = {
        questionIndex: questionIndex,
        value: parseFloat(value),
        categories: question.category,
        leans: question.lean || []
    };

    // Debug logging
    console.log(`Recorded answer ${value} for question ${questionIndex}`);
    console.log(`Categories affected: ${question.category.join(', ')}`);
    console.log(`Leans affected: ${Array.isArray(question.lean) ? question.lean.join(', ') : 'none'}`);
}

console.log("=== Initial State ===");
console.log("scores:", scores);
console.log("leanScores:", leanScores);
console.log("answerHistory:", answerHistory);

function logQuestionCoverage(index) {
    const seenCategories = new Set();
    const seenLeans = new Set();
    
    // Analyze all questions up to current index
    for (let i = 0; i <= index; i++) {
        const q = questions[i];
        q.category.forEach(cat => seenCategories.add(cat));
        if (Array.isArray(q.lean)) {
            q.lean.forEach(lean => seenLeans.add(lean));
        }
    }
    
    console.log(`\n=== Question ${index + 1} Coverage Analysis ===`);
    console.log(`Categories covered: ${seenCategories.size}/15`);
    console.log(`Leans covered: ${seenLeans.size}/24`);
    
    // Log current question details
    const currentQ = questions[index];
    console.log('\nCurrent Question:');
    console.log('Categories:', currentQ.category);
    console.log('Leans:', currentQ.lean || 'None');
}

