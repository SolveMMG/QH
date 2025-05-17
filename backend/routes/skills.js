
const express = require('express');
const { authenticateToken, isEmployer } = require('../middleware/auth');
const router = express.Router();
const { z } = require('zod');

// Validation schema
const skillSchema = z.object({
  name: z.string().min(1).max(50)
});

// Get all skills
router.get('/', async (req, res) => {
  try {
    const prisma = req.prisma;

    const idsParam = req.query.ids;
    let skills;

    if (idsParam) {
      const ids = idsParam.split(',');
      skills = await prisma.skill.findMany({
        where: {
          id: { in: ids }
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      skills = await prisma.skill.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    }

    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ message: 'Server error while fetching skills' });
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
