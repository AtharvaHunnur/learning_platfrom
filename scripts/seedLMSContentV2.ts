import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const v2Courses = [
  {
    title: "Blockchain & Ethereum Developer 2024",
    slug: "blockchain-developer-2024",
    headline: "The complete guide to Smart Contracts, Solidity, and DApps.",
    description: "Learn to build decentralized applications on Ethereum. Master Solidity, Web3.js, and Truffle/Hardhat for production-grade blockchain projects.",
    thumbnail_url: "https://img.youtube.com/vi/h7B-4_gV6xQ/maxresdefault.jpg",
    price: 999,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "Introduction to Blockchain",
        videos: [
          { title: "What is Blockchain?", youtube_video_id: "h7B-4_gV6xQ", order_index: 0 },
          { title: "Ethereum & Smart Contracts", youtube_video_id: "h7B-4_gV6xQ", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "Cyber Security Elite Course (2025 Edition)",
    slug: "cyber-security-2025",
    headline: "Protect networks and data from cyber threats.",
    description: "A comprehensive guide to network security, ethical hacking, cryptography, and risk management in the modern digital age.",
    thumbnail_url: "https://img.youtube.com/vi/N0NKMzT4-Q0/maxresdefault.jpg",
    price: 849,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "Security Fundamentals",
        videos: [
          { title: "Cyber Threats in 2025", youtube_video_id: "N0NKMzT4-Q0", order_index: 0 },
          { title: "Ethical Hacking Basics", youtube_video_id: "N0NKMzT4-Q0", order_index: 1 }
        ]
      }
    ]
  },
  {
    title: "Flutter 3.x Masterclass (Full Course)",
    slug: "flutter-masterclass-2025",
    headline: "Build beautiful cross-platform apps with one codebase.",
    description: "Master Dart and Flutter to create high-performance mobile, web, and desktop apps. Includes state management and API integration.",
    thumbnail_url: "https://img.youtube.com/vi/aM_Jj31c3iY/maxresdefault.jpg",
    price: 649,
    is_published: true,
    is_bestseller: false,
    sections: [
      {
        title: "Dart Programming",
        videos: [
          { title: "Dart Basics", youtube_video_id: "aM_Jj31c3iY", order_index: 0 }
        ]
      }
    ]
  },
  {
    title: "React Native: The Complete Guide",
    slug: "react-native-complete",
    headline: "Build native mobile apps with JavaScript and React.",
    description: "Learn to build truly native iOS and Android apps using the power of React. Covers navigation, styling, and native modules.",
    thumbnail_url: "https://img.youtube.com/vi/yE-Yc4M-Z8U/maxresdefault.jpg",
    price: 699,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "React Native Core",
        videos: [
          { title: "Introduction to React Native", youtube_video_id: "yE-Yc4M-Z8U", order_index: 0 }
        ]
      }
    ]
  },
  {
    title: "DSA in Python: Zero to Pro",
    slug: "dsa-python-one-shot",
    headline: "Master Data Structures & Algorithms for interviews.",
    description: "Cracking the coding interview with Python. Covers Arrays, Linked Lists, Trees, Graphs, and Dynamic Programming.",
    thumbnail_url: "https://img.youtube.com/vi/--NnS--qj08/maxresdefault.jpg",
    price: 799,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "Complexity & Arrays",
        videos: [
          { title: "Big O Notation", youtube_video_id: "--NnS--qj08", order_index: 0 }
        ]
      }
    ]
  },
  {
    title: "The Ultimate Generative AI Roadmap",
    slug: "gen-ai-roadmap-2025",
    headline: "Navigate the world of LLMs, GANs, and AI Agents.",
    description: "Your guide to becoming a GenAI engineer. Learn about Transformers, OpenAI API, and building your own AI applications.",
    thumbnail_url: "https://img.youtube.com/vi/z_2P3yR2s-o/maxresdefault.jpg",
    price: 949,
    is_published: true,
    is_bestseller: true,
    sections: [
      {
        title: "LLM Foundations",
        videos: [
          { title: "Generative AI Overview", youtube_video_id: "z_2P3yR2s-o", order_index: 0 }
        ]
      }
    ]
  },
  {
    title: "C++ Programming Mastery",
    slug: "cpp-mastery-full",
    headline: "Master C++ for high-performance software and systems.",
    description: "From basics to advanced C++ including memory management, STL, and modern C++ features.",
    thumbnail_url: "https://img.youtube.com/vi/8jLOx1hD3_o/hqdefault.jpg",
    price: 449,
    is_published: true,
    is_bestseller: false,
    sections: [
      {
        title: "Fundamentals of C++",
        videos: [
          { title: "C++ Tutorial for Beginners", youtube_video_id: "8jLOx1hD3_o", order_index: 0 }
        ]
      }
    ]
  }
];

async function main() {
  const admin = await prisma.users.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.error("Admin not found");
    return;
  }

  console.log("Updating existing Nodejs course...");
  const nodeCourse = await prisma.subjects.findFirst({ where: { title: "Nodejs" } });
  if (nodeCourse) {
    await prisma.subjects.update({
      where: { id: nodeCourse.id },
      data: {
        title: "Node.js & Express: Modern Backend Development",
        headline: "Build real-world APIs and full-stack applications.",
        description: "Master Node.js, Express, and databases. Learn how to build secure and scalable server-side applications.",
        thumbnail_url: "https://img.youtube.com/vi/EfAl9bwzVZk/maxresdefault.jpg",
        price: 599,
        is_published: true,
        rating: 4.7,
        review_count: 320,
        enrollment_count: 1200
      }
    });

    // Add sections for it if none exist
    const sectionsCount = await prisma.sections.count({ where: { subject_id: nodeCourse.id } });
    if (sectionsCount === 0) {
      const section = await prisma.sections.create({
        data: {
          subject_id: nodeCourse.id,
          title: "Node.js Fundamentals",
          order_index: 0
        }
      });
      await prisma.videos.create({
        data: {
          section_id: section.id,
          title: "Node.js Full Course",
          youtube_video_id: "EfAl9bwzVZk",
          order_index: 0,
          duration_seconds: 25200 // 7 hours
        }
      });
    }
  }

  console.log("Refining pricing for older courses...");
  const coursesToPriceFix = [
    { title: "The Complete 2024 Web Development Bootcamp", price: 699, rating: 4.8 },
    { title: "Python for Data Science and Machine Learning", price: 799, rating: 4.9 },
    { title: "UI/UX Design Masterclass 2024", price: 549, rating: 4.7 },
    { title: "Modern JavaScript from the Beginning", price: 499, rating: 4.8 }
  ];

  for (const fix of coursesToPriceFix) {
    await prisma.subjects.updateMany({
      where: { title: fix.title },
      data: { 
        price: fix.price,
        rating: fix.rating
      }
    });
  }

  console.log("Adding new V2 courses...");
  for (const courseData of v2Courses) {
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
        rating: 4.7,
        review_count: Math.floor(Math.random() * 300) + 20,
        enrollment_count: Math.floor(Math.random() * 800) + 50,
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
            duration_seconds: 3600, // 1 hour dummy
          }
        });
      }
    }
  }

  console.log("V2 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
