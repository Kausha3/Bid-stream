import { Router } from 'express';
import { auctionService } from '../services/auctionService.js';
const router = Router();
/**
 * GET /api/auctions/:id
 * Get auction state
 */
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const state = auctionService.getAuctionState(id);
    if (!state) {
        res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Auction not found',
        });
        return;
    }
    res.json(state);
});
/**
 * POST /api/auctions/:id/reset
 * Reset demo auction (for testing)
 */
router.post('/:id/reset', (req, res) => {
    const { id } = req.params;
    if (id !== 'auction-001') {
        res.status(400).json({
            error: 'INVALID_AUCTION',
            message: 'Only demo auction can be reset',
        });
        return;
    }
    auctionService.resetDemoAuction();
    res.json({ success: true, message: 'Auction reset' });
});
export default router;
