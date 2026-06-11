export interface UserPayload {
  id: string
  email: string
  name: string
  role: "ADMIN" | "TEACHER" | "STUDENT"
  avatar?: string | null
  isVerified: boolean
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface CourseWithDetails {
  id: string
  title: string
  description: string
  thumbnail: string | null
  category: string
  price: number
  isFree: boolean
  rating: number
  totalReviews: number
  isPublished: boolean
  createdAt: Date
  teacher: {
    id: string
    user: {
      name: string
      avatar: string | null
    }
  }
  _count?: {
    enrollments: number
    modules: number
  }
  modules?: {
    id: string
    title: string
    lessons: {
      id: string
      title: string
      type: string
      duration: number | null
    }[]
  }[]
}

export interface LiveClassWithChat {
  id: string
  title: string
  description: string | null
  scheduledAt: Date
  duration: number
  meetingUrl: string
  status: string
  course: {
    id: string
    title: string
  }
  teacher: {
    user: {
      name: string
      avatar: string | null
    }
  }
  chatMessages: {
    id: string
    content: string
    type: string
    fileUrl: string | null
    createdAt: Date
    user: {
      id: string
      name: string
      avatar: string | null
    }
  }[]
}

export interface TeacherApplication {
  id: string
  userId: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  bio: string | null
  subjects: string[]
  resumeUrl: string | null
  rejectionReason: string | null
  yearsExperience: number
  education: string | null
  createdAt: Date
  user: {
    id: string
    name: string
    email: string
    phone: string | null
    avatar: string | null
  }
}

export interface PaymentInitData {
  email: string
  amount: number // in kobo
  reference: string
  metadata: {
    course_id: string
    student_id: string
  }
  callback_url: string
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    reference: string
    status: string
    amount: number
    paid_at: string
    customer: {
      email: string
    }
    metadata: {
      course_id: string
      student_id: string
    }
  }
}

export interface NotificationEvent {
  type: string
  title: string
  body: string
  userId: string
  data?: Record<string, unknown>
}

export interface FileUploadResult {
  url: string
  publicId: string
  format: string
  size: number
}

export enum LessonTypeEnum {
  VIDEO = "VIDEO",
  PDF = "PDF",
  IMAGE = "IMAGE",
}

export enum TeacherStatusEnum {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum LiveClassStatusEnum {
  SCHEDULED = "SCHEDULED",
  LIVE = "LIVE",
  ENDED = "ENDED",
  CANCELLED = "CANCELLED",
}
