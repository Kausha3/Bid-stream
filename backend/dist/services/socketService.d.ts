import { Server as HttpServer } from 'http';
import type { ServerToClientEvents } from '../types/index.js';
declare class SocketService {
    private io;
    private roomViewers;
    private auctionTimers;
    initialize(httpServer: HttpServer): void;
    private handleJoinAuction;
    private handleLeaveAuction;
    private handlePlaceBid;
    private handleDisconnect;
    private updateViewerCount;
    private setupAuctionEndTimer;
    private handleAuctionEnd;
    /**
     * Emit to all clients in an auction room
     */
    emitToAuction(auctionId: string, event: keyof ServerToClientEvents, data: unknown): void;
    /**
     * Get current viewer count for an auction
     */
    getViewerCount(auctionId: string): number;
}
export declare const socketService: SocketService;
export {};
