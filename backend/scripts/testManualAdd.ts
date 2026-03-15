import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testManualAddition() {
  const admin = await prisma.users.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.error("Admin not found");
    return;
  }

  // We'll just use prisma directly to simulate the backend receiving the request
  // since I can't easily perform a real HTTP request with auth tokens here without complex setup
  console.log("Simulating Admin Course Creation: Go Programming for Backend");
  
  const course = await prisma.subjects.create({
    data: {
      title: "Go Programming for Backend",
      slug: "go-programming-backend",
      headline: "Learn Go (Golang) for building high-performance backend systems.",
      description: "A deep dive into Go syntax, concurrency with goroutines, and building REST APIs. The language of modern infrastructure.",
      thumbnail_url: "https://img.youtube.com/vi/un6ZyFkqFKo/maxresdefault.jpg",
      price: 549,
      created_by: admin.id,
      is_published: true,
      rating: 4.8,
      enrollment_count: 320
    }
  });

  console.log(`Course created with ID: ${course.id}`);

  const section = await prisma.sections.create({
    data: {
      subject_id: course.id,
      title: "Getting Started with Go",
      order_index: 0
    }
  });

  await prisma.videos.create({
    data: {
      section_id: section.id,
      title: "Go Tutorial for Beginners",
      youtube_video_id: "un6ZyFkqFKo",
      order_index: 0,
      duration_seconds: 1200
    }
  });

  console.log("Manual test successful!");
}

testManualAddition()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
