import Ranking from '../models/Ranking.model.js';
import Stall from '../models/Stall.model.js';
import { successResponse, errorResponse } from '../helpers/response.js';

/**
 * Ranking Controller
 * Handles ranking operations and leaderboard
 */

/**
 * Get all rankings (leaderboard)
 * @route GET /api/ranking
 */
const getAllRankings = async (req, res, next) => {
  try {
    const rankings = await Ranking.findAll();
    
    // Enrich with stall details
    const enrichedRankings = await Promise.all(
      rankings.map(async (ranking) => {
        const stall = await Stall.findById(ranking.stall_id);
        return {
          ...ranking,
          stall_name: stall ? stall.stall_name : 'Unknown',
          stall_number: stall ? stall.stall_number : null,
          school_name: stall ? stall.school_name : null
        };
      })
    );

    // Sort by rank (ascending)
    enrichedRankings.sort((a, b) => a.rank - b.rank);

    return successResponse(res, enrichedRankings);
  } catch (error) {
    next(error);
  }
};

/**
 * Get ranking by stall ID
 * @route GET /api/ranking/stall/:stallId
 */
const getRankingByStall = async (req, res, next) => {
  try {
    const { stallId } = req.params;
    
    const stall = await Stall.findById(stallId);
    if (!stall) {
      return errorResponse(res, 'Stall not found', 404);
    }

    const ranking = await Ranking.findByStallId(stallId);
    if (!ranking) {
      return errorResponse(res, 'Ranking not found for this stall', 404);
    }

    return successResponse(res, {
      ...ranking,
      stall_name: stall.stall_name,
      stall_number: stall.stall_number,
      school_name: stall.school_name
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get top N stalls
 * @route GET /api/ranking/top/:limit
 */
const getTopRankings = async (req, res, next) => {
  try {
    const { limit } = req.params;
    const limitNum = parseInt(limit) || 10;

    const rankings = await Ranking.findAll();
    
    // Enrich with stall details
    const enrichedRankings = await Promise.all(
      rankings.map(async (ranking) => {
        const stall = await Stall.findById(ranking.stall_id);
        return {
          ...ranking,
          stall_name: stall ? stall.stall_name : 'Unknown',
          stall_number: stall ? stall.stall_number : null,
          school_name: stall ? stall.school_name : null
        };
      })
    );

    // Sort by rank and limit
    const topRankings = enrichedRankings
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limitNum);

    return successResponse(res, topRankings);
  } catch (error) {
    next(error);
  }
};

/**
 * Update ranking (admin only)
 * @route PUT /api/ranking/:id
 */
const updateRanking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rank, score } = req.body;

    const updateData = {};
    if (rank !== undefined) updateData.rank = rank;
    if (score !== undefined) updateData.score = score;

    const updatedRanking = await Ranking.update(id, updateData);
    if (!updatedRanking) {
      return errorResponse(res, 'Ranking not found', 404);
    }

    return successResponse(res, updatedRanking, 'Ranking updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate and update rankings based on feedback and visits (admin only)
 * @route POST /api/ranking/calculate
 */
const calculateRankings = async (req, res, next) => {
  try {
    const Feedback = require('../models/Feedback.model');
    const CheckInOut = require('../models/CheckInOut.model');
    const stalls = await Stall.findAll();

    const stallScores = await Promise.all(
      stalls.map(async (stall) => {
        // Get feedback stats
        const feedback = await Feedback.findByStallId(stall.id);
        const avgRating = feedback.length > 0
          ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
          : 0;

        // Get visit count
        const visits = await CheckInOut.findByStallId(stall.id);
        const visitCount = visits.length;

        // Calculate score (weighted: 70% rating, 30% visits)
        // Normalize visits to a 0-5 scale (assuming max 100 visits)
        const normalizedVisits = Math.min(visitCount / 20, 5);
        const score = (avgRating * 0.7) + (normalizedVisits * 0.3);

        return {
          stall_id: stall.id,
          score: parseFloat(score.toFixed(2)),
          total_feedback: feedback.length,
          total_visits: visitCount
        };
      })
    );

    // Sort by score (descending)
    stallScores.sort((a, b) => b.score - a.score);

    // Update rankings
    const updatedRankings = [];
    for (let i = 0; i < stallScores.length; i++) {
      const stallScore = stallScores[i];
      const rank = i + 1;

      // Check if ranking exists
      const existingRanking = await Ranking.findByStallId(stallScore.stall_id);
      
      if (existingRanking) {
        const updated = await Ranking.update(existingRanking.id, {
          rank,
          score: stallScore.score
        });
        updatedRankings.push(updated);
      } else {
        const created = await Ranking.create({
          stall_id: stallScore.stall_id,
          rank,
          score: stallScore.score
        });
        updatedRankings.push(created);
      }
    }

    return successResponse(res, {
      total_stalls: stallScores.length,
      rankings: updatedRankings
    }, 'Rankings calculated and updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create ranking (admin only)
 * @route POST /api/ranking
 */
const createRanking = async (req, res, next) => {
  try {
    const { stall_id, rank, score } = req.body;

    if (!stall_id || rank === undefined) {
      return errorResponse(res, 'Stall ID and rank are required', 400);
    }

    // Verify stall exists
    const stall = await Stall.findById(stall_id);
    if (!stall) {
      return errorResponse(res, 'Stall not found', 404);
    }

    // Check if ranking already exists
    const existingRanking = await Ranking.findByStallId(stall_id);
    if (existingRanking) {
      return errorResponse(res, 'Ranking already exists for this stall', 409);
    }

    const rankingData = {
      stall_id,
      rank,
      score: score || 0
    };

    const newRanking = await Ranking.create(rankingData);

    return successResponse(res, newRanking, 'Ranking created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete ranking (admin only)
 * @route DELETE /api/ranking/:id
 */
const deleteRanking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const deleted = await Ranking.delete(id);
    if (!deleted) {
      return errorResponse(res, 'Ranking not found', 404);
    }

    return successResponse(res, null, 'Ranking deleted successfully');
  } catch (error) {
    next(error);
  }
};

export default {
  getAllRankings,
  getRankingByStall,
  getTopRankings,
  updateRanking,
  calculateRankings,
  createRanking,
  deleteRanking
};
