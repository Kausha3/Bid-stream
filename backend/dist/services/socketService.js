import { Server } from 'socket.io';
import { config } from '../config/index.js';
import { auctionService } from './auctionService.js';
import { stripeService } from './stripeService.js';
class SocketService {
    io = null;
    // Track viewers per auction room
    roomViewers = new Map();
    // Auction end timers
    auctionTimers = new Map();
    initialize(httpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: config.frontendUrl,
                methods: ['GET', 'POST'],
                credentials: true,
            },
            pingTimeout: 60000,
            pingInterval: 25000,
        });
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            // Handle join auction room
            socket.on('join_auction', (auctionId) => {
                this.handleJoinAuction(socket, auctionId);
            });
            // Handle leave auction room
            socket.on('leave_auction', (auctionId) => {
                this.handleLeaveAuction(socket, auctionId);
            });
            // Handle place bid
            socket.on('place_bid', (payload) => {
                this.handlePlaceBid(socket, payload);
            });
            // Handle heartbeat
            socket.on('heartbeat', () => {
                socket.emit('connection_status', 'CONNECTED');
            });
            // Handle disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
        console.log('Socket.io server initialized');
    }
    handleJoinAuction(socket, auctionId) {
        // Leave any existing room
        if (socket.data.auctionId) {
            socket.leave(`auction:${socket.data.auctionId}`);
            this.updateViewerCount(socket.data.auctionId, socket.id, false);
        }
        // Join new room
        socket.join(`auction:${auctionId}`);
        socket.data.auctionId = auctionId;
        // Update viewer count
        this.updateViewerCount(auctionId, socket.id, true);
        // Send current auction state
        const state = auctionService.getAuctionState(auctionId);
        if (state) {
            socket.emit('auction_state', state);
            // Setup auction end timer if not already set
            this.setupAuctionEndTimer(auctionId);
        }
        socket.emit('connection_status', 'CONNECTED');
        console.log(`Client ${socket.id} joined auction ${auctionId}`);
    }
    handleLeaveAuction(socket, auctionId) {
        socket.leave(`auction:${auctionId}`);
        this.updateViewerCount(auctionId, socket.id, false);
        socket.data.auctionId = undefined;
        console.log(`Client ${socket.id} left auction ${auctionId}`);
    }
    async handlePlaceBid(socket, payload) {
        console.log(`Bid received from ${socket.id}:`, payload);
        // Place bid with atomic operation
        const result = await auctionService.placeBid(payload);
        if (!result.success || !result.bid) {
            socket.emit('bid_error', result.error);
            return;
        }
        // Cancel previous leader's payment hold
        if (result.previousLeaderPaymentIntentId) {
            await stripeService.cancelPaymentHold(result.previousLeaderPaymentIntentId);
            console.log(`Cancelled payment hold for outbid user: ${result.previousLeaderPaymentIntentId}`);
        }
        // Broadcast bid to all viewers in the room
        this.io?.to(`auction:${payload.auctionId}`).emit('bid_update', result.bid);
        // If time was extended (anti-sniping), broadcast new end time
        if (result.newEndTime) {
            this.io?.to(`auction:${payload.auctionId}`).emit('time_extended', result.newEndTime);
            // Reset the auction end timer
            this.setupAuctionEndTimer(payload.auctionId);
        }
        console.log(`Bid accepted: ${result.bid.amount} from ${result.bid.userName}`);
    }
    handleDisconnect(socket) {
        if (socket.data.auctionId) {
            this.updateViewerCount(socket.data.auctionId, socket.id, false);
        }
        console.log(`Client disconnected: ${socket.id}`);
    }
    updateViewerCount(auctionId, socketId, isJoining) {
        if (!this.roomViewers.has(auctionId)) {
            this.roomViewers.set(auctionId, new Set());
        }
        const viewers = this.roomViewers.get(auctionId);
        if (isJoining) {
            viewers.add(socketId);
        }
        else {
            viewers.delete(socketId);
        }
        const count = viewers.size;
        auctionService.updateViewerCount(auctionId, count);
        // Broadcast to room
        this.io?.to(`auction:${auctionId}`).emit('viewer_update', count);
    }
    setupAuctionEndTimer(auctionId) {
        // Clear existing timer
        const existingTimer = this.auctionTimers.get(auctionId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const auction = auctionService.getAuction(auctionId);
        if (!auction || auction.status !== 'LIVE')
            return;
        const timeUntilEnd = auction.endTime - Date.now();
        if (timeUntilEnd <= 0) {
            // Auction already ended
            this.handleAuctionEnd(auctionId);
            return;
        }
        // Set timer for auction end
        const timer = setTimeout(() => {
            this.handleAuctionEnd(auctionId);
        }, timeUntilEnd);
        this.auctionTimers.set(auctionId, timer);
        console.log(`Auction ${auctionId} will end in ${Math.round(timeUntilEnd / 1000)}s`);
    }
    async handleAuctionEnd(auctionId) {
        console.log(`Auction ${auctionId} ending...`);
        const result = auctionService.endAuction(auctionId);
        if (!result)
            return;
        // Broadcast auction end to all viewers
        this.io?.to(`auction:${auctionId}`).emit('auction_ended', result);
        // Handle payment finalization
        const auction = auctionService.getAuction(auctionId);
        if (!auction)
            return;
        if (result.status === 'SOLD' && auction.leadingPaymentIntentId) {
            // Capture winner's payment
            const captureResult = await stripeService.capturePayment(auction.leadingPaymentIntentId);
            console.log(`Payment capture for winner ${result.winnerId}:`, captureResult);
        }
        // Cancel all other payment holds
        const allHolds = auctionService.getPaymentHoldsForAuction(auctionId);
        for (const hold of allHolds) {
            if (hold.paymentIntentId !== auction.leadingPaymentIntentId) {
                await stripeService.cancelPaymentHold(hold.paymentIntentId);
                auctionService.updatePaymentHoldStatus(hold.paymentIntentId, 'CANCELLED');
            }
        }
        // Clean up timer
        this.auctionTimers.delete(auctionId);
    }
    /**
     * Emit to all clients in an auction room
     */
    emitToAuction(auctionId, event, data) {
        this.io?.to(`auction:${auctionId}`).emit(event, data);
    }
    /**
     * Get current viewer count for an auction
     */
    getViewerCount(auctionId) {
        return this.roomViewers.get(auctionId)?.size || 0;
    }
}
// Export singleton instance
export const socketService = new SocketService();
