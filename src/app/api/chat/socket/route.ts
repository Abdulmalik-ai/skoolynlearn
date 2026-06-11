import { Server as NetServer } from "http"
import { NextRequest } from "next/server"
import { Server as ServerIO } from "socket.io"

export const dynamic = "force-dynamic"

interface SocketServer extends NetServer {
  io?: ServerIO
}

interface SocketResponse {
  socket: {
    server: SocketServer
  }
}

export async function GET(req: NextRequest, res: SocketResponse) {
  if (res.socket?.server?.io) {
    return new Response("Socket.io already running", { status: 200 })
  }

  const io = new ServerIO(res.socket.server as any, {
    path: "/api/socket/io",
    addTrailingSlash: false,
  })

  res.socket.server.io = io

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id)

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId)
      socket.to(roomId).emit("user-joined", { userId: socket.id, timestamp: new Date().toISOString() })
    })

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId)
      socket.to(roomId).emit("user-left", { userId: socket.id, timestamp: new Date().toISOString() })
    })

    socket.on("send-message", (data: { roomId: string; message: any }) => {
      io.to(data.roomId).emit("new-message", {
        ...data.message,
        createdAt: new Date().toISOString(),
      })
    })

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id)
    })
  })

  return new Response("Socket.io initialized", { status: 200 })
}
