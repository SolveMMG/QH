const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Sample data
const skills = [
  "React", "Node.js", "TypeScript", "JavaScript", "Python", 
  "UI/UX Design", "GraphQL", "React Native", "AWS", "Docker",
  "SQL", "MongoDB", "Express", "Next.js", "Vue.js",
  "Angular", "DevOps", "PHP", "Laravel", "Django",
  "Ruby on Rails", "C#", ".NET", "Java", "Spring Boot"
];

const employers = [
  { name: "Tech Innovations Inc", email: "employer1@example.com", password: "password123" },
  { name: "Digital Solutions Ltd", email: "employer2@example.com", password: "password123" },
  { name: "Future Web Systems", email: "employer3@example.com", password: "password123" },
  { name: "CodeCraft Studios", email: "employer4@example.com", password: "password123" },
  { name: "Quantum Software", email: "employer5@example.com", password: "password123" }
];

const freelancers = [
  { name: "Alex Johnson", email: "freelancer1@example.com", password: "password123" },
  { name: "Sam Rodriguez", email: "freelancer2@example.com", password: "password123" },
  { name: "Jordan Lee", email: "freelancer3@example.com", password: "password123" },
  { name: "Taylor Smith", email: "freelancer4@example.com", password: "password123" },
  { name: "Jamie Wilson", email: "freelancer5@example.com", password: "password123" },
  { name: "Morgan Davis", email: "freelancer6@example.com", password: "password123" },
  { name: "Riley Garcia", email: "freelancer7@example.com", password: "password123" },
  { name: "Casey Thomas", email: "freelancer8@example.com", password: "password123" }
];

const jobTitles = [
  "Frontend Developer for E-commerce Website",
  "Backend Engineer for API Development",
  "Full Stack Developer for SaaS Platform",
  "React Native Mobile App Developer",
  "UI/UX Designer for Financial App",
  "DevOps Engineer for Cloud Migration",
  "Database Administrator",
  "WordPress Developer",
  "Machine Learning Engineer",
  "QA Automation Specialist",
  "Blockchain Developer",
  "Cybersecurity Specialist",
  "Technical Content Writer",
  "SEO Specialist",
  "Game Developer"
];

const jobDescriptions = [
  "We're looking for an experienced frontend developer to help us build our new e-commerce platform. You'll be working with React, Redux, and styled-components to create responsive and user-friendly interfaces.",
  "Join our team to develop RESTful APIs using Node.js and Express. You'll be responsible for designing and implementing scalable backend solutions for our growing user base.",
  "We need a talented full stack developer who can work on both frontend and backend aspects of our SaaS platform. Experience with MERN or MEAN stack is required.",
  "Help us build our mobile app using React Native. You'll be working closely with our design and backend teams to create a seamless mobile experience.",
  "Design intuitive and beautiful user interfaces for our financial application. You should have experience in user research, wireframing, and prototyping.",
  "Assist us in migrating our infrastructure to AWS. Experience with Docker, Kubernetes, and CI/CD pipelines is a must.",
  "Manage and optimize our database systems. You'll be responsible for performance tuning, backup strategies, and data security.",
  "Create and maintain WordPress websites for our clients. You should be familiar with custom theme development and popular plugins.",
  "Develop machine learning models for our data analysis platform. Experience with Python, TensorFlow, and PyTorch is required.",
  "Design and implement automated testing strategies for our web applications. Experience with Selenium, Jest, and CI/CD is preferred.",
  "Help us develop blockchain solutions using Solidity and Web3. You'll be working on smart contracts and decentralized applications.",
  "Enhance our security infrastructure and implement best practices for data protection. Experience with penetration testing and security audits is a plus.",
  "Create engaging technical content for our blog and documentation. You should have strong writing skills and understanding of technical concepts.",
  "Optimize our website for search engines and improve our online visibility. Experience with keyword research and analytics tools is required.",
  "Develop interactive games using Unity or Unreal Engine. Experience with 3D modeling and animation is a plus."
];

// Function to create skills
async function createSkills() {
  console.log('Creating skills...');
  
  const skillPromises = skills.map(async (skillName) => {
    return prisma.skill.upsert({
      where: { name: skillName },
      update: {},
      create: { name: skillName }
    });
  });
  
  return Promise.all(skillPromises);
}

// Function to create users
async function createUsers() {
  console.log('Creating users...');
  
  // Create employers
  const employerPromises = employers.map(async (employer) => {
    const hashedPassword = await bcrypt.hash(employer.password, 10);
    
    return prisma.user.upsert({
      where: { email: employer.email },
      update: {},
      create: {
        name: employer.name,
        email: employer.email,
        password: hashedPassword,
        role: 'EMPLOYER',
        lastLogin: new Date()
      }
    });
  });
  
  // Create freelancers
  const freelancerPromises = freelancers.map(async (freelancer) => {
    const hashedPassword = await bcrypt.hash(freelancer.password, 10);
    
    return prisma.user.upsert({
      where: { email: freelancer.email },
      update: {},
      create: {
        name: freelancer.name,
        email: freelancer.email,
        password: hashedPassword,
        role: 'FREELANCER',
        lastLogin: new Date()
      }
    });
  });
  
  const createdEmployers = await Promise.all(employerPromises);
  const createdFreelancers = await Promise.all(freelancerPromises);
  
  return {
    employers: createdEmployers,
    freelancers: createdFreelancers
  };
}

// Function to create jobs
async function createJobs(createdEmployers, createdSkills) {
  console.log('Creating jobs...');
  
  const jobs = [];
  
  // Create 3 jobs for each employer
  for (const employer of createdEmployers) {
    for (let i = 0; i < 3; i++) {
      // Get a random job title and description
      const titleIndex = Math.floor(Math.random() * jobTitles.length);
      const title = `${jobTitles[titleIndex]} ${i + 1}`;
      const description = jobDescriptions[titleIndex % jobDescriptions.length];
      
      // Generate a random budget between $500 and $10000
      const budget = Math.floor(Math.random() * 9500) + 500;
      
      // Pick 3-5 random skills for this job
      const jobSkillCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 skills
      const shuffledSkills = [...createdSkills].sort(() => 0.5 - Math.random());
      const selectedSkills = shuffledSkills.slice(0, jobSkillCount);
      
      // Create job with selected skills
      const job = await prisma.job.create({
        data: {
          title,
          description,
          budget,
          employerId: employer.id,
          status: Math.random() > 0.2 ? 'OPEN' : (Math.random() > 0.5 ? 'CLOSED' : 'ARCHIVED'),
          skills: {
            create: selectedSkills.map(skill => ({
              skill: {
                connect: { id: skill.id }
              }
            }))
          }
        }
      });
      
      jobs.push(job);
    }
  }
  
  return jobs;
}

// Function to create applications
async function createApplications(createdJobs, createdFreelancers) {
  console.log('Creating job applications...');
  
  const applications = [];
  
  // For each job, let some random freelancers apply
  for (const job of createdJobs) {
    // Only allow applications for open jobs
    if (job.status === 'OPEN') {
      // Shuffle freelancers
      const shuffledFreelancers = [...createdFreelancers].sort(() => 0.5 - Math.random());
      
      // Pick 0-4 random freelancers to apply for this job
      const applicantCount = Math.floor(Math.random() * 5);
      const selectedFreelancers = shuffledFreelancers.slice(0, applicantCount);
      
      // Create applications
      for (const freelancer of selectedFreelancers) {
        try {
          const application = await prisma.application.create({
            data: {
              message: `I am interested in this job and believe my skills in ${job.title.split(' ').slice(0, 3).join(' ')} make me a perfect candidate. I have several years of experience in similar projects and can deliver high-quality work on time.`,
              jobId: job.id,
              freelancerId: freelancer.id
            }
          });
          
          applications.push(application);
        } catch (error) {
          // Skip duplicate applications
          console.log(`Skipping duplicate application for job ${job.id} by freelancer ${freelancer.id}`);
        }
      }
    }
  }
  
  return applications;
}

// Main seeding function
async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Create skills
    const createdSkills = await createSkills();
    console.log(`Created ${createdSkills.length} skills`);
    
    // Create users
    const users = await createUsers();
    console.log(`Created ${users.employers.length} employers and ${users.freelancers.length} freelancers`);
    
    // Create jobs
    const createdJobs = await createJobs(users.employers, createdSkills);
    console.log(`Created ${createdJobs.length} jobs`);
    
    // Create applications
    const createdApplications = await createApplications(createdJobs, users.freelancers);
    console.log(`Created ${createdApplications.length} job applications`);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seed();