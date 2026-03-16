import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const courses = [
  {
    title: "Python Full Course for Beginners 2024",
    slug: "python-full-course",
    headline: "Master Python from zero to hero with hands-on projects.",
    description: "This comprehensive Python course covers everything from basic syntax to advanced concepts like OOP, file handling, and real-world projects. Perfect for absolute beginners.",
    thumbnail_url: "https://img.youtube.com/vi/8KCuHHeC_M0/maxresdefault.jpg",
    price: 499,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "Introduction & Setup",
        videos: [
          { title: "Python Tutorial for Beginners", youtube_video_id: "8KCuHHeC_M0", order_index: 0 },
          { title: "Variables & Data Types", youtube_video_id: "8KCuHHeC_M0", order_index: 1 }
        ]
      },
      {
        title: "Logic & Control Flow",
        videos: [
          { title: "If Statements & Loops", youtube_video_id: "8KCuHHeC_M0", order_index: 0 },
          { title: "Functions & Modules", youtube_video_id: "8KCuHHeC_M0", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "The Ultimate JavaScript Crash Course 2025",
    slug: "javascript-crash-course",
    headline: "Learn modern JavaScript (ES6+) in just 90 minutes!",
    description: "Deep dive into variables, functions, DOM manipulation, and asynchronous JS. Build a solid foundation for React and Next.js.",
    thumbnail_url: "https://img.youtube.com/vi/bMknfKXLg7Q/maxresdefault.jpg",
    price: 399,
    is_published: true,
    is_bestseller: false,
    sections: [
      {
        title: "Modern JS Fundamentals",
        videos: [
          { title: "Variables & Scoping", youtube_video_id: "bMknfKXLg7Q", order_index: 0 },
          { title: "Asynchronous JavaScript", youtube_video_id: "bMknfKXLg7Q", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "React 19 Zero to Hero Guide",
    slug: "react-zero-to-hero",
    headline: "Build modern, fast web applications with React.",
    description: "Master components, hooks, state management, and the latest React 19 features including Server Components and Actions.",
    thumbnail_url: "https://img.youtube.com/vi/yJg-Y5by_jU/maxresdefault.jpg",
    price: 699,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "React Core Concepts",
        videos: [
          { title: "JSX & Components", youtube_video_id: "yJg-Y5by_jU", order_index: 0 },
          { title: "State & Props", youtube_video_id: "yJg-Y5by_jU", order_index: 1 }
        ]
      },
      {
        title: "Advanced Hooks",
        videos: [
          { title: "useEffect & Context API", youtube_video_id: "yJg-Y5by_jU", order_index: 0 }
        ]
      }
    ]
  },
  {
    title: "Next.js 15 Foundations",
    slug: "nextjs-15-foundations",
    headline: "The complete guide to Next.js 15 App Router.",
    description: "Learn Server Components, Data Fetching, Routing, and Optimizations with the latest version of Next.js.",
    thumbnail_url: "https://img.youtube.com/vi/6jQdZcYY8OY/maxresdefault.jpg",
    price: 799,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "App Router Architecture",
        videos: [
          { title: "Layouts & Pages", youtube_video_id: "6jQdZcYY8OY", order_index: 0 },
          { title: "Server Side Rendering", youtube_video_id: "6jQdZcYY8OY", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "AWS Cloud Practitioner 2025",
    slug: "aws-cloud-practitioner",
    headline: "Get certified and understand the AWS Cloud.",
    description: "Prepare for the AWS Cloud Practitioner exam with a full walkthrough of EC2, S3, RDS, and IAM.",
    thumbnail_url: "https://img.youtube.com/vi/CqYf-o7eU_g/maxresdefault.jpg",
    price: 999,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "Compute & Storage",
        videos: [
          { title: "EC2 Essentials", youtube_video_id: "CqYf-o7eU_g", order_index: 0 },
          { title: "S3 Deep Dive", youtube_video_id: "CqYf-o7eU_g", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "DevOps Full Roadmap Course",
    slug: "devops-roadmap",
    headline: "The path to becoming a DevOps Engineer.",
    description: "Learn Git, CI/CD, Terraform, Grafana, and everything you need to manage modern infrastructure.",
    thumbnail_url: "https://img.youtube.com/vi/2L12J1F7Heg/maxresdefault.jpg",
    price: 899,
    is_published: true,
    is_bestseller: false,
    sections: [
      {
        title: "Automation & Infrastructure",
        videos: [
          { title: "Docker Containerization", youtube_video_id: "2L12J1F7Heg", order_index: 0 },
          { title: "Terraform IaC", youtube_video_id: "2L12J1F7Heg", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "UI/UX Design with Figma",
    slug: "uiux-design-figma",
    headline: "Master professional design workflows in Figma.",
    description: "From wireframing to high-fidelity prototypes. Learn the principles of modern UI/UX design.",
    thumbnail_url: "https://img.youtube.com/vi/Zf149tL6b_U/maxresdefault.jpg",
    price: 599,
    is_published: true,
    is_bestseller: false,
    sections: [
      {
        title: "Design Principles",
        videos: [
          { title: "Typography & Color Theory", youtube_video_id: "Zf149tL6b_U", order_index: 0 },
          { title: "Prototyping in Figma", youtube_video_id: "Zf149tL6b_U", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "Java Microservices Masterclass",
    slug: "java-microservices",
    headline: "Build scalable backends with Spring Boot & Docker.",
    description: "Learn microservices architecture, API gateways, service discovery, and container deployment with Java.",
    thumbnail_url: "https://img.youtube.com/vi/v_z-16h4hBw/maxresdefault.jpg",
    price: 749,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "Microservices Architecture",
        videos: [
          { title: "Spring Cloud Services", youtube_video_id: "v_z-16h4hBw", order_index: 0 }
        ]
      }
    ]
  },
  {
    title: "Docker & Kubernetes Crash Course",
    slug: "docker-k8s-crash-course",
    headline: "Master containers and orchestration in one go.",
    description: "Learn how to containerize apps with Docker and manage them at scale with Kubernetes clusters.",
    thumbnail_url: "https://img.youtube.com/vi/X48VuDVv0A8/maxresdefault.jpg",
    price: 349,
    is_published: true,
    is_bestseller: false,
    sections: [
      {
        title: "Container Basics",
        videos: [
          { title: "Docker Walkthrough", youtube_video_id: "X48VuDVv0A8", order_index: 0 }
        ]
      },
      {
        title: "Orchestration",
        videos: [
          { title: "Kubernetes PODs & Services", youtube_video_id: "X48VuDVv0A8", order_index: 0 }
        ]
      }
    ]
  }
];

async function main() {
  console.log("Cleaning up existing subjects (Optional - but recommended for clean seed)...");
  // We'll skip cleanup to avoid deleting user custom courses, but for a "bulk" replenishment we might want to ensure slugs are unique
  
  const admin = await prisma.users.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.error("Admin user not found. Please run seedAdmin first.");
    return;
  }

  for (const courseData of courses) {
    const { sections, ...courseInfo } = courseData;
    
    // Check if course exists by slug
    const existing = await prisma.subjects.findFirst({ where: { slug: courseInfo.slug } });
    if (existing) {
      console.log(`Skipping existing course: ${courseInfo.title}`);
      continue;
    }

    console.log(`Creating course: ${courseInfo.title}`);
    const createdCourse = await prisma.subjects.create({
      data: {
        ...courseInfo,
        created_by: admin.id,
        rating: 4.5,
        review_count: Math.floor(Math.random() * 500) + 50,
        enrollment_count: Math.floor(Math.random() * 2000) + 100,
      }
    });

    for (const sectionData of sections) {
      const { videos, ...sectionInfo } = sectionData;
      const createdSection = await prisma.sections.create({
        data: {
          ...sectionInfo,
          subject_id: createdCourse.id,
          order_index: sections.indexOf(sectionData)
        }
      });

      for (const videoData of videos) {
        await prisma.videos.create({
          data: {
            ...videoData,
            section_id: createdSection.id,
            duration_seconds: 600, // 10 mins dummy
          }
        });
      }
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
