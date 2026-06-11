"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Video, Mic, MicOff, Camera, CameraOff, MessageCircle, Users, Radio, Send } from "lucide-react"

interface LiveClassRoomProps {
  liveClass: {
    id: string
    title: string
    meetingUrl: string
    status: string
    teacher: { user: { name: string; avatar: string | null } }
  }
  userRole: "TEACHER" | "STUDENT"
}

interface ChatMessage {
  id: string
  content: string
  user: { name: string }
  createdAt: string
}

export function LiveClassRoom({ liveClass, userRole }: LiveClassRoomProps) {
  const [chatOpen, setChatOpen] = useState(true)
  const [jitsiLoaded, setJitsiLoaded] = useState(false)
  const [participants, setParticipants] = useState(1)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const jitsiUrl = liveClass.meetingUrl || `https://meet.jit.si/skoolyn-liveclass-${liveClass.id}`

  useEffect(() => {
    const timer = setTimeout(() => setJitsiLoaded(true), 2000)

    // Fetch actual participants count periodically
    const interval = setInterval(() => {
      fetch(`/api/teacher/live-classes/${liveClass.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data?.enrollments) {
            setParticipants(res.data.enrollments + 1)
          }
        })
        .catch(() => {})
    }, 10000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [liveClass.id, liveClass.meetingUrl])

  useEffect(() => {
    // Fetch chat messages periodically
    const interval = setInterval(() => {
      fetch(`/api/student/live-classes/${liveClass.id}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data?.chatMessages) {
            setMessages(res.data.chatMessages.map((m: any) => ({
              id: m.id,
              content: m.content,
              user: m.user || { name: "User" },
              createdAt: m.createdAt,
            })))
          }
        })
        .catch(() => {})
    }, 3000)
    return () => clearInterval(interval)
  }, [liveClass.id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    try {
      const res = await fetch(`/api/student/live-classes/${liveClass.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage, type: "text" }),
      })
      const data = await res.json()
      if (data.success) {
        setNewMessage("")
        setMessages((prev) => [...prev, { id: Date.now().toString(), content: newMessage, user: { name: "You" }, createdAt: new Date().toISOString() }])
      }
    } catch { toast.error("Failed to send message") }
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{liveClass.title}</h1>
            <p className="text-sm text-slate-500">Instructor: {liveClass.teacher.user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={liveClass.status === "LIVE" ? "destructive" : "secondary"} className={liveClass.status === "LIVE" ? "animate-pulse bg-red-500" : ""}>
              <Radio className="w-3 h-3 mr-1" />
              {liveClass.status}
            </Badge>
            <Badge variant="outline">
              <Users className="w-3 h-3 mr-1" />
              {participants} in room
            </Badge>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden relative min-h-[400px]">
          {!jitsiLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <Video className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                <p className="font-medium">Connecting to live class...</p>
                <p className="text-sm text-slate-400 mt-2">Powered by Jitsi Meet</p>
              </div>
            </div>
          )}
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
            onLoad={() => setJitsiLoaded(true)}
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button variant={isMicOn ? "default" : "secondary"} size="icon" onClick={() => setIsMicOn(!isMicOn)}>
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button variant={isCamOn ? "default" : "secondary"} size="icon" onClick={() => setIsCamOn(!isCamOn)}>
            {isCamOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setChatOpen(!chatOpen)} className="lg:hidden">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </Button>
        </div>
      </div>

      {chatOpen && (
        <Card className="w-full lg:w-80 flex flex-col max-h-[calc(100vh-5rem)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
            <div className="flex-1 overflow-y-auto space-y-3 mb-3">
              {messages.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-4">No messages yet. Say hello!</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-xs text-primary">{msg.user.name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg p-2">{msg.content}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
