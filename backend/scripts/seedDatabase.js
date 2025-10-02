import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { Course } from '../models/Course.js';
import { StudyGroup } from '../models/StudyGroup.js';
import { connectDB } from '../config/db.js';

dotenv.config();

const categories = ['Programming', 'Data Science', 'Web Development', 'Mobile Development', 'AI & ML', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'UI/UX Design', 'Blockchain'];

const skills = ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Machine Learning', 'TypeScript', 'Java', 'C++', 'SQL', 'Vue.js', 'Angular', 'Django', 'Flask', 'Kubernetes', 'TensorFlow', 'PyTorch', 'GraphQL'];

const mentorNames = [
  { name: 'Dr. Sarah Johnson', email: 'sarah.johnson@edu.com' },
  { name: 'Prof. Michael Chen', email: 'michael.chen@edu.com' },
  { name: 'Dr. Emily Rodriguez', email: 'emily.rodriguez@edu.com' },
  { name: 'Prof. David Kim', email: 'david.kim@edu.com' },
  { name: 'Dr. Lisa Anderson', email: 'lisa.anderson@edu.com' },
  { name: 'Prof. James Wilson', email: 'james.wilson@edu.com' },
  { name: 'Dr. Maria Garcia', email: 'maria.garcia@edu.com' },
  { name: 'Prof. Robert Taylor', email: 'robert.taylor@edu.com' },
  { name: 'Dr. Jennifer Lee', email: 'jennifer.lee@edu.com' },
  { name: 'Prof. Thomas Brown', email: 'thomas.brown@edu.com' },
];

const studentNames = [
  { name: 'Alex Thompson', email: 'alex.thompson@student.com' },
  { name: 'Jessica Martinez', email: 'jessica.martinez@student.com' },
  { name: 'Ryan Patel', email: 'ryan.patel@student.com' },
  { name: 'Sophia Lee', email: 'sophia.lee@student.com' },
  { name: 'Daniel Brown', email: 'daniel.brown@student.com' },
  { name: 'Emma Wilson', email: 'emma.wilson@student.com' },
  { name: 'James Garcia', email: 'james.garcia@student.com' },
  { name: 'Olivia Taylor', email: 'olivia.taylor@student.com' },
  { name: 'Lucas Anderson', email: 'lucas.anderson@student.com' },
  { name: 'Ava Martinez', email: 'ava.martinez@student.com' },
  { name: 'Ethan Clark', email: 'ethan.clark@student.com' },
  { name: 'Mia Robinson', email: 'mia.robinson@student.com' },
  { name: 'Noah Walker', email: 'noah.walker@student.com' },
  { name: 'Isabella Harris', email: 'isabella.harris@student.com' },
  { name: 'William Young', email: 'william.young@student.com' },
  { name: 'Charlotte King', email: 'charlotte.king@student.com' },
  { name: 'Benjamin Wright', email: 'benjamin.wright@student.com' },
  { name: 'Amelia Lopez', email: 'amelia.lopez@student.com' },
  { name: 'Henry Hill', email: 'henry.hill@student.com' },
  { name: 'Harper Scott', email: 'harper.scott@student.com' },
  { name: 'Jack Green', email: 'jack.green@student.com' },
  { name: 'Ella Adams', email: 'ella.adams@student.com' },
  { name: 'Samuel Baker', email: 'samuel.baker@student.com' },
  { name: 'Grace Nelson', email: 'grace.nelson@student.com' },
  { name: 'Leo Carter', email: 'leo.carter@student.com' },
  { name: 'Lily Mitchell', email: 'lily.mitchell@student.com' },
  { name: 'Owen Perez', email: 'owen.perez@student.com' },
  { name: 'Chloe Roberts', email: 'chloe.roberts@student.com' },
  { name: 'Mason Turner', email: 'mason.turner@student.com' },
  { name: 'Zoe Phillips', email: 'zoe.phillips@student.com' },
];

const postTitles = [
  'Introduction to React Hooks',
  'Building RESTful APIs with Node.js',
  'Machine Learning Fundamentals',
  'Advanced JavaScript Patterns',
  'Docker and Kubernetes Basics',
  'Python for Data Science',
  'Web Security Best Practices',
  'MongoDB Schema Design',
  'CI/CD Pipeline Setup',
  'Cloud Architecture Patterns',
  'TypeScript Advanced Types',
  'Microservices Architecture',
  'GraphQL vs REST API',
  'Agile Development Methodology',
  'Test-Driven Development',
  'Design Patterns in JavaScript',
  'AWS Lambda Functions',
  'React Performance Optimization',
  'Database Indexing Strategies',
  'Git Workflow Best Practices',
  'Responsive Web Design Principles',
  'Vue.js State Management with Vuex',
  'Angular Dependency Injection',
  'Redux Toolkit Modern Patterns',
  'WebSocket Real-time Communication',
  'JWT Authentication Implementation',
  'CSS Grid and Flexbox Mastery',
  'Progressive Web Apps (PWA)',
  'Server-Side Rendering with Next.js',
  'GraphQL Schema Design',
  'Docker Multi-Stage Builds',
  'Kubernetes Pod Networking',
  'AWS S3 Security Best Practices',
  'React Context API Deep Dive',
  'Node.js Streams and Buffers',
  'MongoDB Aggregation Pipeline',
  'SQL Query Optimization',
  'Redis Caching Strategies',
  'Nginx Load Balancing',
  'OAuth 2.0 Implementation',
  'WebAssembly Introduction',
  'Electron Desktop Apps',
  'React Native Mobile Development',
  'Flutter Cross-Platform Apps',
  'TensorFlow Neural Networks',
  'PyTorch Deep Learning',
  'Pandas Data Manipulation',
  'NumPy Array Operations',
  'Matplotlib Data Visualization',
  'Scikit-learn ML Algorithms',
];

const postContents = [
  'In this comprehensive guide, we\'ll explore React Hooks and how they revolutionize functional components. Learn about useState, useEffect, useContext, and custom hooks with real-world examples.',
  'Learn how to build scalable and secure RESTful APIs using Node.js and Express. We\'ll cover routing, middleware, authentication, error handling, and industry best practices.',
  'Dive deep into machine learning concepts including supervised learning, unsupervised learning, neural networks, and practical implementations with hands-on projects.',
  'Explore advanced JavaScript patterns including closures, promises, async/await, generators, and functional programming techniques that will level up your code.',
  'Master containerization with Docker and orchestration with Kubernetes. Learn how to deploy, scale, and manage containerized applications in production environments.',
  'Comprehensive guide to using Python for data analysis, visualization, and machine learning. Includes pandas, numpy, matplotlib, and scikit-learn tutorials.',
  'Learn essential web security practices including XSS prevention, CSRF protection, SQL injection prevention, secure authentication, and compliance standards.',
  'Best practices for designing MongoDB schemas, including embedding vs referencing, indexing strategies, query optimization, and performance tuning.',
  'Set up automated CI/CD pipelines using GitHub Actions, Jenkins, or GitLab CI. Learn about testing automation, building, deployment strategies, and rollback procedures.',
  'Explore cloud architecture patterns including serverless computing, microservices, event-driven architecture, and scalability strategies for modern applications.',
  'Deep dive into TypeScript\'s advanced type system including generics, utility types, conditional types, mapped types, and type inference.',
  'Learn how to design and implement microservices architecture, including service discovery, API gateways, inter-service communication, and distributed tracing.',
  'Compare GraphQL and REST API architectures, understanding when to use each approach, their respective trade-offs, and migration strategies.',
  'Master Agile methodology including Scrum, Kanban, sprint planning, daily standups, retrospectives, and continuous improvement practices.',
  'Learn Test-Driven Development (TDD) approach, writing tests first, building robust maintainable code, and achieving high test coverage.',
  'Explore design patterns like Singleton, Factory, Observer, Strategy, Decorator, and how to apply them in JavaScript applications.',
  'Build serverless applications with AWS Lambda, including triggers, layers, environment variables, and integration with other AWS services.',
  'Optimize React applications for better performance using memoization, lazy loading, code splitting, profiling tools, and React DevTools.',
  'Learn database indexing strategies, B-tree vs Hash indexes, covering indexes, query optimization, and how to improve database performance at scale.',
  'Master Git workflows including branching strategies, pull requests, code reviews, merge vs rebase, and collaborative development practices.',
  'Learn modern responsive web design principles using CSS Grid, Flexbox, media queries, mobile-first approach, and accessibility standards.',
  'Master state management in Vue.js using Vuex, including modules, actions, mutations, getters, and best practices for large applications.',
  'Understand Angular\'s dependency injection system, providers, injectors, hierarchical DI, and creating reusable services.',
  'Explore Redux Toolkit modern patterns including createSlice, createAsyncThunk, RTK Query, and migration from classic Redux.',
  'Implement real-time communication using WebSockets, Socket.io, handling reconnections, scalability, and broadcasting strategies.',
  'Build secure JWT-based authentication systems, including token refresh, blacklisting, role-based access control, and security best practices.',
  'Master CSS Grid and Flexbox layouts, understanding when to use each, creating responsive designs, and common layout patterns.',
  'Build Progressive Web Apps with service workers, offline functionality, push notifications, and installability features.',
  'Learn server-side rendering with Next.js, static site generation, incremental static regeneration, and performance optimization.',
  'Design scalable GraphQL schemas with proper type definitions, resolvers, error handling, and N+1 query optimization.',
  'Optimize Docker builds using multi-stage builds, layer caching, reducing image size, and security hardening.',
  'Understand Kubernetes networking including pod-to-pod communication, services, ingress, network policies, and DNS.',
  'Implement AWS S3 security best practices including bucket policies, IAM roles, encryption, versioning, and access logging.',
  'Deep dive into React Context API for state management, avoiding prop drilling, performance considerations, and composition patterns.',
  'Master Node.js streams and buffers for efficient data processing, handling large files, and building scalable applications.',
  'Learn MongoDB aggregation pipeline stages including match, group, project, lookup, and building complex queries.',
  'Optimize SQL queries using indexes, query execution plans, avoiding N+1 queries, and database-specific optimizations.',
  'Implement Redis caching strategies including cache-aside, write-through, cache invalidation, and distributed caching.',
  'Configure Nginx as a load balancer, reverse proxy, handling SSL/TLS, rate limiting, and high availability setups.',
  'Implement OAuth 2.0 authentication flow, understanding authorization code, implicit grant, client credentials, and refresh tokens.',
  'Introduction to WebAssembly, compiling from C/Rust, performance benefits, and integration with JavaScript.',
  'Build cross-platform desktop applications with Electron, IPC communication, native modules, and distribution.',
  'Develop mobile apps with React Native, navigation, native modules, performance optimization, and deployment to app stores.',
  'Create cross-platform applications with Flutter, widgets, state management, animations, and platform-specific code.',
  'Build neural networks with TensorFlow, understanding layers, activation functions, loss functions, and training models.',
  'Implement deep learning models with PyTorch, dynamic computation graphs, GPU acceleration, and model deployment.',
  'Master data manipulation with Pandas, DataFrames, filtering, grouping, merging, and data cleaning techniques.',
  'Understand NumPy array operations, broadcasting, vectorization, linear algebra, and performance optimization.',
  'Create stunning data visualizations with Matplotlib, customizing plots, subplots, and creating publication-ready figures.',
  'Apply machine learning algorithms with Scikit-learn, classification, regression, clustering, and model evaluation.',
];

const comments = [
  'This is really helpful! Could you explain more about the performance implications?',
  'Great explanation! I tried this approach and it worked perfectly in my project.',
  'I have a question about error handling in this scenario. What\'s the best practice?',
  'Thanks for sharing! This clarified many doubts I had about this topic.',
  'Could you provide more examples of real-world use cases for this pattern?',
  'Excellent post! Very detailed and easy to follow. Looking forward to more content.',
  'I\'m getting an error when I try to implement this. Any suggestions on debugging?',
  'This is exactly what I was looking for. Thank you for the comprehensive guide!',
  'How does this compare to other approaches? What are the trade-offs?',
  'Amazing tutorial! The step-by-step explanation really helped me understand.',
  'Could you share more resources or documentation links for further reading?',
  'I implemented this in production and it works great! Thanks for the tutorial.',
  'What about scalability concerns? How does this pattern handle high load?',
  'Is there a TypeScript version of this implementation available?',
  'Great content! I\'ve shared this with my study group.',
];

const replies = [
  'Great question! Let me explain the performance implications in more detail. This approach uses O(n) time complexity...',
  'I\'m glad it helped! Feel free to ask if you have more questions or need clarification.',
  'For error handling, I recommend using try-catch blocks with proper error boundaries. Here\'s an example...',
  'You\'re welcome! Happy to help. Check out my other posts for related content.',
  'Sure! Here are some real-world examples from production systems I\'ve worked on...',
  'Thank you for the positive feedback! More content coming soon on related topics.',
  'Can you share the error message? I\'ll help you debug it. Also check your Node.js version.',
  'Glad you found it useful! Don\'t hesitate to reach out if you need more help.',
  'Compared to other approaches, this method is more efficient because it avoids unnecessary re-renders...',
  'Thanks! Make sure to follow for updates when I publish new content.',
  'Absolutely! Here are some excellent resources: [links]. The official documentation is also great.',
  'That\'s awesome! Glad to hear it\'s working well in production. Any specific optimizations you made?',
  'Good question! For scalability, consider implementing caching and database indexing. Here\'s how...',
  'Yes! I can provide a TypeScript version. Give me a moment to type it out...',
  'Thanks for sharing! If your study group has questions, feel free to tag me.',
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB(process.env.MONGO_URI);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Course.deleteMany({});
    await StudyGroup.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create Mentors with varied points and levels for leaderboard
    console.log('👨‍🏫 Creating mentors...');
    const mentors = [];
    const mentorLevels = [10, 9, 8, 7, 6, 8, 7, 6, 5, 4];
    const mentorPoints = [3500, 3200, 2800, 2400, 2000, 2700, 2300, 1900, 1500, 1200];

    for (let i = 0; i < mentorNames.length; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mentor = await User.create({
        name: mentorNames[i].name,
        email: mentorNames[i].email,
        password: hashedPassword,
        role: 'Mentor',
        points: mentorPoints[i],
        level: mentorLevels[i],
        bio: `Experienced educator specializing in ${categories[i % categories.length]}. Passionate about teaching and mentoring students with ${5 + i} years of experience.`,
        skills: skills.slice(i * 2, i * 2 + 5),
        stats: {
          postsCreated: Math.floor(Math.random() * 30) + 10,
          questionsAnswered: Math.floor(Math.random() * 80) + 20,
          loginStreak: Math.floor(Math.random() * 20) + 5,
        },
        badges: [
          { name: 'Expert', icon: '👑', description: 'Reached level 5+' },
          { name: 'Knowledge Sharer', icon: '💡', description: 'Created 10+ posts' },
          { name: 'Helpful Mentor', icon: '🌟', description: 'Answered 20+ student questions' },
          { name: 'Community Leader', icon: '🏆', description: 'Top contributor' },
        ]
      });
      mentors.push(mentor);
    }
    console.log(`✅ Created ${mentors.length} mentors\n`);

    // Create Students with varied points for better leaderboard distribution
    console.log('👨‍🎓 Creating students...');
    const students = [];
    const studentLevels = [7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 5, 4, 3, 3, 2, 2, 2, 1, 1, 1];
    const studentPoints = [2200, 1900, 1850, 1600, 1550, 1300, 1250, 1200, 900, 850, 800, 550, 500, 480, 450, 200, 180, 150, 120, 100, 1700, 1400, 950, 920, 600, 580, 520, 250, 220, 190];

    for (let i = 0; i < studentNames.length; i++) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const student = await User.create({
        name: studentNames[i].name,
        email: studentNames[i].email,
        password: hashedPassword,
        role: 'Student',
        points: studentPoints[i],
        level: studentLevels[i],
        bio: `Passionate learner interested in ${categories[Math.floor(Math.random() * categories.length)]}. Always eager to learn new technologies and build cool projects!`,
        skills: skills.slice(Math.floor(Math.random() * 10), Math.floor(Math.random() * 10) + 4),
        interests: categories.slice(Math.floor(Math.random() * 5), Math.floor(Math.random() * 5) + 4),
        stats: {
          commentsPosted: Math.floor(Math.random() * 50) + Math.floor(studentPoints[i] / 100),
          coursesCompleted: Math.floor(Math.random() * 8) + Math.floor(studentLevels[i] / 2),
          studyGroupsJoined: Math.floor(Math.random() * 5) + 1,
          loginStreak: Math.floor(Math.random() * 15) + 1,
        },
        badges: studentLevels[i] >= 5 ? [
          { name: 'Active Learner', icon: '📚', description: 'Posted 20+ comments' },
          { name: 'Rising Star', icon: '⭐', description: 'Earned 1000+ points' },
          { name: 'Course Completer', icon: '🎓', description: 'Completed 3+ courses' },
        ] : studentLevels[i] >= 3 ? [
          { name: 'Active Learner', icon: '📚', description: 'Posted 10+ comments' },
          { name: 'Rising Star', icon: '⭐', description: 'Earned 500+ points' },
        ] : [
          { name: 'First Steps', icon: '🎯', description: 'Started your learning journey' },
        ]
      });
      students.push(student);
    }
    console.log(`✅ Created ${students.length} students\n`);

    // Create Posts
    console.log('📝 Creating posts...');
    const posts = [];
    for (let i = 0; i < postTitles.length; i++) {
      const mentor = mentors[Math.floor(Math.random() * mentors.length)];
      const post = await Post.create({
        title: postTitles[i],
        content: postContents[i],
        category: categories[Math.floor(Math.random() * categories.length)],
        tags: skills.slice(Math.floor(Math.random() * 15), Math.floor(Math.random() * 15) + 4),
        createdBy: mentor._id,
        likesCount: Math.floor(Math.random() * 80) + 10,
        viewsCount: Math.floor(Math.random() * 500) + 50,
        isPinned: i < 3, // Pin first 3 posts
        createdAt: new Date(Date.now() - Math.random() * 30 * 86400000), // Random date within last 30 days
      });
      posts.push(post);
    }
    console.log(`✅ Created ${posts.length} posts\n`);

    // Create Comments with more variety
    console.log('💬 Creating comments...');
    let commentCount = 0;
    for (const post of posts) {
      const numComments = Math.floor(Math.random() * 8) + 2; // 2-9 comments per post
      for (let i = 0; i < numComments; i++) {
        const student = students[Math.floor(Math.random() * students.length)];
        const hasReply = Math.random() > 0.3; // 70% chance of reply
        const numReplies = hasReply ? Math.floor(Math.random() * 3) + 1 : 0;

        const commentReplies = [];
        for (let j = 0; j < numReplies; j++) {
          commentReplies.push({
            mentorId: post.createdBy,
            message: replies[Math.floor(Math.random() * replies.length)],
            createdAt: new Date(Date.now() - Math.random() * 20 * 86400000),
          });
        }

        await Comment.create({
          postId: post._id,
          userId: student._id,
          message: comments[Math.floor(Math.random() * comments.length)],
          replies: commentReplies,
          createdAt: new Date(Date.now() - Math.random() * 25 * 86400000),
        });
        commentCount++;
      }
    }
    console.log(`✅ Created ${commentCount} comments\n`);

    // Create Courses
    console.log('📚 Creating courses...');
    const courses = [];
    const courseTopics = [
      'Complete Web Development Bootcamp',
      'Data Science with Python',
      'Machine Learning A-Z',
      'React - The Complete Guide',
      'Node.js Masterclass',
      'AWS Certified Solutions Architect',
      'Docker and Kubernetes Complete Guide',
      'Cybersecurity Fundamentals',
      'Mobile App Development with React Native',
      'Full Stack JavaScript Development',
      'Advanced TypeScript Programming',
      'Vue.js - From Beginner to Advanced',
      'Angular Complete Course',
      'Python Django Web Framework',
      'GraphQL API Development',
      'Blockchain Development',
      'DevOps Engineering',
      'Cloud Computing with Azure',
      'iOS Development with Swift',
      'Android Development with Kotlin',
    ];

    for (let i = 0; i < courseTopics.length; i++) {
      const mentor = mentors[i % mentors.length];
      const difficulty = ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)];
      const course = await Course.create({
        title: courseTopics[i],
        description: `Comprehensive ${courseTopics[i]} course covering everything from basics to advanced concepts. Perfect for ${difficulty.toLowerCase()} learners. Includes hands-on projects and real-world examples.`,
        category: categories[Math.floor(Math.random() * categories.length)],
        tags: skills.slice(i * 2, i * 2 + 4),
        difficulty: difficulty,
        mentorId: mentor._id,
        enrollmentCount: Math.floor(Math.random() * 150) + 20,
        completionCount: Math.floor(Math.random() * 50) + 5,
        isPublished: true,
        totalDuration: Math.floor(Math.random() * 600) + 200,
        averageRating: (Math.random() * 1.5 + 3.5).toFixed(1),
        lessons: [
          {
            title: 'Introduction and Course Overview',
            description: 'Get started with the course and understand what you\'ll learn',
            content: 'Welcome to the course! In this lesson, we\'ll cover the course structure, prerequisites, and set up your development environment.',
            order: 1,
            duration: 25,
            videoUrl: 'https://example.com/video1',
          },
          {
            title: 'Fundamentals and Core Concepts',
            description: 'Learn the fundamental concepts and principles',
            content: 'Deep dive into the core concepts and principles. This lesson covers the foundational knowledge you need.',
            order: 2,
            duration: 45,
            videoUrl: 'https://example.com/video2',
          },
          {
            title: 'Intermediate Topics',
            description: 'Build on your knowledge with intermediate concepts',
            content: 'Now that you understand the basics, let\'s explore more advanced topics and patterns.',
            order: 3,
            duration: 50,
            videoUrl: 'https://example.com/video3',
          },
          {
            title: 'Hands-on Project',
            description: 'Build a real-world project',
            content: 'Apply what you\'ve learned by building a complete project from scratch. This will solidify your understanding.',
            order: 4,
            duration: 80,
            videoUrl: 'https://example.com/video4',
          },
          {
            title: 'Best Practices and Optimization',
            description: 'Learn industry best practices',
            content: 'Discover best practices, optimization techniques, and how professionals approach problems.',
            order: 5,
            duration: 40,
            videoUrl: 'https://example.com/video5',
          },
        ]
      });
      courses.push(course);

      // Enroll random students
      const numEnrollments = Math.floor(Math.random() * 15) + 5;
      for (let j = 0; j < numEnrollments; j++) {
        const student = students[Math.floor(Math.random() * students.length)];
        if (!course.enrolledStudents.includes(student._id)) {
          course.enrolledStudents.push(student._id);
          if (!student.enrolledCourses.includes(course._id)) {
            student.enrolledCourses.push(course._id);

            // Some students complete courses
            if (Math.random() > 0.6) {
              student.completedCourses.push(course._id);
            }

            await student.save();
          }
        }
      }
      await course.save();
    }
    console.log(`✅ Created ${courses.length} courses\n`);

    // Create Study Groups
    console.log('👥 Creating study groups...');
    const groupNames = [
      'React Developers Circle',
      'Python Data Science Group',
      'Full Stack Learners',
      'Machine Learning Enthusiasts',
      'Cloud Computing Study Group',
      'Web Development Community',
      'JavaScript Masters',
      'DevOps Discussion Group',
      'TypeScript Ninjas',
      'Vue.js Community',
      'Angular Developers',
      'Mobile Dev Hub',
      'Cybersecurity Squad',
      'Blockchain Builders',
      'AI Research Group',
    ];

    const studyGroups = [];
    for (let i = 0; i < groupNames.length; i++) {
      const creator = students[i % students.length];
      const group = await StudyGroup.create({
        name: groupNames[i],
        description: `A collaborative space for learning and discussing ${categories[i % categories.length]}. Share resources, ask questions, work on projects together, and grow as a community!`,
        category: categories[i % categories.length],
        tags: skills.slice(i, i + 4),
        creatorId: creator._id,
        isPrivate: Math.random() > 0.7,
        requireApproval: Math.random() > 0.5,
        members: [{
          userId: creator._id,
          role: 'admin',
          joinedAt: new Date(Date.now() - Math.random() * 40 * 86400000),
        }],
      });

      // Add random members
      const numMembers = Math.floor(Math.random() * 15) + 3;
      for (let j = 0; j < numMembers; j++) {
        const member = students[Math.floor(Math.random() * students.length)];
        if (!group.members.some(m => m.userId.toString() === member._id.toString())) {
          const role = Math.random() > 0.9 ? 'moderator' : 'member';
          group.members.push({
            userId: member._id,
            role: role,
            joinedAt: new Date(Date.now() - Math.random() * 35 * 86400000),
          });
          if (!member.studyGroups.includes(group._id)) {
            member.studyGroups.push(group._id);
            await member.save();
          }
        }
      }
      group.memberCount = group.members.length;
      await group.save();
      studyGroups.push(group);
    }
    console.log(`✅ Created ${studyGroups.length} study groups\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('🎉 Database Seeding Completed Successfully!');
    console.log('═══════════════════════════════════════');
    console.log(`👨‍🏫 Mentors: ${mentors.length}`);
    console.log(`👨‍🎓 Students: ${students.length}`);
    console.log(`📝 Posts: ${posts.length}`);
    console.log(`💬 Comments: ${commentCount}`);
    console.log(`📚 Courses: ${courses.length}`);
    console.log(`👥 Study Groups: ${studyGroups.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('📋 Test Credentials (All passwords: password123):');
    console.log('\n👨‍🏫 MENTORS:');
    mentorNames.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name.padEnd(25)} | ${m.email}`);
    });
    console.log('\n👨‍🎓 STUDENTS (showing first 10):');
    studentNames.slice(0, 10).forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name.padEnd(25)} | ${s.email}`);
    });
    console.log(`\n  ... and ${studentNames.length - 10} more students`);
    console.log('\n✨ Password for all accounts: password123');
    console.log('\n🏆 Leaderboard will show users with varying points and levels!');
    console.log('📊 Courses have enrolled students and some completions!');
    console.log('👥 Study groups have active members!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
