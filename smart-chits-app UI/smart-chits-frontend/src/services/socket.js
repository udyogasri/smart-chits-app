const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws')

const sockets = new Map()

export function connectAuctionSocket(auctionId, onMessage, onError) {
  if (sockets.has(auctionId)) {
    return
  }

  const socket = new WebSocket(`${WS_BASE_URL}/auction/ws/${auctionId}`)

  socket.onopen = () => {
    console.info(`Auction socket connected: ${auctionId}`)
  }

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      onMessage?.(message)
    } catch (error) {
      console.error('Invalid auction socket message:', error)
    }
  }

  socket.onerror = (error) => {
    console.error(`Auction socket error for ${auctionId}:`, error)
    onError?.(error)
  }

  socket.onclose = () => {
    sockets.delete(auctionId)
  }

  sockets.set(auctionId, socket)
}

export function disconnectAuctionSocket(auctionId) {
  const socket = sockets.get(auctionId)
  if (socket) {
    socket.close()
    sockets.delete(auctionId)
  }
}

export function disconnectAllAuctionSockets() {
  sockets.forEach((socket, auctionId) => {
    try {
      socket.close()
    } catch (error) {
      console.error(`Failed to close auction socket ${auctionId}:`, error)
    }
  })
  sockets.clear()
}
