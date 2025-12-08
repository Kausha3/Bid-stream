import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { config } from './config/index.js';
import { socketService } from './services/socketService.js';
import { stripeService } from './services/stripeService.js';
import paymentRoutes from './routes/paymentRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
const app = express();
const httpServer = createServer(app);
// CORS configuration
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
}));
// Webhook routes need raw body (must be before json middleware)
app.use('/api/webhooks', webhookRoutes);
// Parse JSON for all other routes
app.use(express.json());
// Health check
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        stripeConfigured: stripeService.isConfigured(),
    });
});
// API Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/auctions', auctionRoutes);
// Initialize Socket.io
socketService.initialize(httpServer);
// Start server
httpServer.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   BidStream Backend Server                                   ║
║                                                              ║
║   HTTP:     http://localhost:${config.port}                        ║
║   Socket:   ws://localhost:${config.port}                          ║
║   Mode:     ${config.nodeEnv.padEnd(45)}║
║   Stripe:   ${(stripeService.isConfigured() ? 'Configured' : 'Demo Mode').padEnd(45)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
