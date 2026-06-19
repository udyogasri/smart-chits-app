import asyncio
from typing import Dict, List
from fastapi import WebSocket


class AuctionConnectionManager:
    def __init__(self):
        self.connections: Dict[int, List[WebSocket]] = {}
        self.loop: asyncio.AbstractEventLoop | None = None

    def set_event_loop(self, loop: asyncio.AbstractEventLoop):
        self.loop = loop

    async def connect(self, websocket: WebSocket, auction_id: int):
        await websocket.accept()
        self.connections.setdefault(auction_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, auction_id: int):
        connections = self.connections.get(auction_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections:
            self.connections.pop(auction_id, None)

    async def broadcast(self, auction_id: int, message: dict):
        connections = list(self.connections.get(auction_id, []))
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection, auction_id)

    def schedule(self, coro):
        if self.loop is not None:
            asyncio.run_coroutine_threadsafe(coro, self.loop)


manager = AuctionConnectionManager()


def broadcast_auction_event(event: str, payload: dict, auction_id: int):
    if manager.loop is None:
        return

    message = {
        "event": event,
        "auctionId": auction_id,
        "payload": payload,
    }

    manager.schedule(manager.broadcast(auction_id, message))


def broadcast_auction_timer(auction):
    if manager.loop is None:
        return

    message = {
        "event": "auction:timer",
        "auctionId": auction.id,
        "payload": {
            "auctionId": auction.id,
            "status": auction.status,
            "durationMinutes": auction.duration_minutes,
            "startedAt": auction.started_at.isoformat() if auction.started_at else None,
        },
    }

    manager.schedule(manager.broadcast(auction.id, message))
