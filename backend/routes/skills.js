
const express = require('express');
const { authenticateToken, isEmployer } = require('../middleware/auth');
const router = express.Router();
const { z } = require('zod');

// Validation schema
const skillSchema = z.object({
  name: z.string().min(1).max(50)
});

// GET /api/skills?ids=id1,id2,id3
router.get('/skills', async (req, res) => {
  const { ids } = req.query;

  try {
    if (ids) {
      const idArray = typeof ids === 'string' ? ids.split(',') : [];
      const skills = await prisma.skill.findMany({
        where: {
          id: {
            in: idArray,
          },
        },
      });
      return res.json(skills);
    }

    const allSkills = await prisma.skill.findMany();
    res.json(allSkills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create a new skill (employer only)
router.post('/', authenticateToken, isEmployer, async (req, res) => {
  try {
    // Validate request body
    const validation = skillSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input data', 
        errors: validation.error.errors 
      });
    }

    const { name } = req.body;
    const prisma = req.prisma;

    // Check if skill already exists
    const existingSkill = await prisma.skill.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingSkill) {
      return res.json({ skill: existingSkill });
    }

    // Create skill
    const skill = await prisma.skill.create({
      data: {
        name
      }
    });

    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    res.status(500).json({ message: 'Server error while creating skill' });
  }
});

// Seed initial skills (for development purposes)
router.post('/seed', async (req, res) => {
  try {
    const prisma = req.prisma;
    
    // Sample skills to seed
    const skillsToSeed = [
      "React",
      "Node.js",
      "TypeScript",
      "Python",
      "UI/UX Design",
      "JavaScript",
      "GraphQL",
      "React Native",
      "AWS",
      "Docker"
    ];

    // Create skills if they don't exist
    const createdSkills = await Promise.all(
      skillsToSeed.map(async (skillName) => {
        const existingSkill = await prisma.skill.findFirst({
          where: {
            name: {
              equals: skillName,
              mode: 'insensitive'
            }
          }
        });

        if (existingSkill) {
          return existingSkill;
        }

        return prisma.skill.create({
          data: {
            name: skillName
          }
        });
      })
    );

    res.json({
      message: 'Skills seeded successfully',
      skills: createdSkills
    });
  } catch (error) {
    console.error('Error seeding skills:', error);
    res.status(500).json({ message: 'Server error while seeding skills' });
  }
});

module.exports = router;
