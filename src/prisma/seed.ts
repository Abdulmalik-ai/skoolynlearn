import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@skoolyn.com" },
    update: {},
    create: {
      email: "admin@skoolyn.com",
      name: "System Admin",
      password: adminPassword,
      role: "ADMIN",
      isVerified: true,
      phone: "+2348000000001",
    },
  })
  console.log("Admin created:", admin.email)

  // Create Teacher
  const teacherPassword = await bcrypt.hash("teacher123", 12)
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@skoolyn.com" },
    update: {},
    create: {
      email: "teacher@skoolyn.com",
      name: "Jane Doe",
      password: teacherPassword,
      role: "TEACHER",
      isVerified: true,
      phone: "+2348000000002",
    },
  })

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      status: "APPROVED",
      bio: "Experienced software engineer with 10+ years teaching web development and programming. Passionate about making complex concepts accessible to everyone.",
      subjects: "Programming, Web Development, Computer Science",
      yearsExperience: 10,
      education: "MSc Computer Science, MIT",
    },
  })
  console.log("Teacher created:", teacherUser.email)

  // Create Student
  const studentPassword = await bcrypt.hash("student123", 12)
  const studentUser = await prisma.user.upsert({
    where: { email: "student@skoolyn.com" },
    update: {},
    create: {
      email: "student@skoolyn.com",
      name: "John Smith",
      password: studentPassword,
      role: "STUDENT",
      isVerified: true,
      phone: "+2348000000003",
    },
  })

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      gradeLevel: "University",
      interests: "Programming, Design",
    },
  })
  console.log("Student created:", studentUser.email)

  // Create Sample Courses
  const courses = [
    {
      title: "Introduction to Web Development",
      description:
        "Learn the fundamentals of HTML, CSS, and JavaScript. Build responsive websites from scratch and understand how the web works. This course is perfect for beginners with no prior coding experience.",
      category: "Programming",
      price: 15000,
      isFree: false,
      isPublished: true,
    },
    {
      title: "UI/UX Design Fundamentals",
      description:
        "Master the principles of user interface and user experience design. Learn wireframing, prototyping, and design tools like Figma. Create beautiful, user-centered digital products.",
      category: "Design",
      price: 0,
      isFree: true,
      isPublished: true,
    },
    {
      title: "React & Next.js Masterclass",
      description:
        "Build modern web applications with React and Next.js. Learn hooks, server components, API routes, and deployment. Includes real-world projects and best practices.",
      category: "Programming",
      price: 25000,
      isFree: false,
      isPublished: true,
    },
    {
      title: "Digital Marketing Strategy",
      description:
        "Learn SEO, social media marketing, email campaigns, and content strategy. Grow your business or freelance career with proven digital marketing techniques.",
      category: "Marketing",
      price: 12000,
      isFree: false,
      isPublished: true,
    },
    {
      title: "Data Science with Python",
      description:
        "Introduction to data analysis, visualization, and machine learning using Python. Work with pandas, numpy, matplotlib, and scikit-learn on real datasets.",
      category: "Science",
      price: 0,
      isFree: true,
      isPublished: true,
    },
  ]

  for (const courseData of courses) {
    const course = await prisma.course.upsert({
      where: { id: "seed-course-" + courseData.title.slice(0, 10).toLowerCase().replace(/\s/g, "-") },
      update: {},
      create: {
        id: "seed-course-" + courseData.title.slice(0, 10).toLowerCase().replace(/\s/g, "-"),
        ...courseData,
        teacherId: teacherProfile.id,
        thumbnail: `https://placehold.co/600x400/2563EB/FFFFFF?text=${encodeURIComponent(courseData.title)}`,
      },
    })

    // Create modules and lessons
    const module = await prisma.module.upsert({
      where: { id: `seed-module-${course.id}` },
      update: {},
      create: {
        id: `seed-module-${course.id}`,
        title: "Getting Started",
        order: 0,
        courseId: course.id,
      },
    })

    await prisma.lesson.upsert({
      where: { id: `seed-lesson-${course.id}` },
      update: {},
      create: {
        id: `seed-lesson-${course.id}`,
        title: "Introduction",
        type: "VIDEO",
        url: "https://example.com/intro.mp4",
        duration: 300,
        order: 0,
        moduleId: module.id,
      },
    })

    console.log("Course created:", course.title)
  }

  // Create Enrollment for student in free course
  const freeCourse = await prisma.course.findFirst({ where: { isFree: true } })
  if (freeCourse) {
    await prisma.enrollment.upsert({
      where: {
        courseId_studentId: {
          courseId: freeCourse.id,
          studentId: studentUser.id,
        },
      },
      update: {},
      create: {
        courseId: freeCourse.id,
        studentId: studentUser.id,
        isPaid: true,
        amountPaid: 0,
      },
    })
    console.log("Enrollment created for free course")
  }

  console.log("Seed completed successfully!")
  console.log("Login credentials:")
  console.log("Admin: admin@skoolyn.com / admin123")
  console.log("Teacher: teacher@skoolyn.com / teacher123")
  console.log("Student: student@skoolyn.com / student123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
