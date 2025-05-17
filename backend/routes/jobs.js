
const express = require('express');
const { authenticateToken, isEmployer } = require('../middleware/auth');
const router = express.Router();
const { z } = require('zod');

// Validation schemas
const jobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  budget: z.number().positive(),
  skills: z.array(z.string()).min(1)
});

const jobUpdateSchema = jobSchema.partial().extend({
  status: z.enum(['OPEN', 'CLOSED', 'ARCHIVED']).optional()
});

// Get all jobs (public route with optional filtering)
router.get('/', async (req, res) => {
  try {
    const prisma = req.prisma;
    const { 
      skills, 
      search, 
      status = 'OPEN', 
      page = 1, 
      limit = 6 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build filter conditions
    const where = {
      deletedAt: null, // Only show non-deleted jobs
    };

    // Status filter
    if (status) {
      where.status = status;
    }

    // Search filter (title or description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Skills filter
    if (skills && skills.length) {
      const skillIds = Array.isArray(skills) ? skills : [skills];
      where.skills = {
        some: {
          skillId: { in: skillIds }
        }
      };
    }

    // Get jobs with filters
    const [jobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          skills: {
            include: {
              skill: true
            }
          },
          applications: {
            select: {
              id: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take
      }),
      prisma.job.count({ where })
    ]);

    // Format response
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      status: job.status,
      createdAt: job.createdAt,
      employerId: job.employerId,
      employerName: job.employer.name,
      skills: job.skills.map(js => ({
        id: js.skill.id,
        name: js.skill.name
      })),
      applicationCount: job.applications.length
    }));

    res.json({
      jobs: formattedJobs,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: take,
        pages: Math.ceil(totalCount / take)
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
});

// Get single job by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const prisma = req.prisma;

    const job = await prisma.job.findUnique({
      where: { 
        id,
        deletedAt: null 
      },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        },
        applications: {
          select: {
            id: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Format response
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      status: job.status,
      createdAt: job.createdAt,
      employerId: job.employerId,
      employerName: job.employer.name,
      skills: job.skills.map(js => ({
        id: js.skill.id,
        name: js.skill.name
      })),
      applicationCount: job.applications.length
    };

    res.json(formattedJob);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Server error while fetching job' });
  }
});

// Create a new job (employer only)
router.post('/', authenticateToken, isEmployer, async (req, res) => {
  try {
    // Validate request body
    const validation = jobSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input data', 
        errors: validation.error.errors 
      });
    }

    const { title, description, budget, skills } = req.body;
    const employerId = req.user.id;
    const prisma = req.prisma;

    // Create job with skills
    const job = await prisma.job.create({
      data: {
        title,
        description,
        budget,
        employerId,
        skills: {
          create: skills.map(skillId => ({
            skill: {
              connect: { id: skillId }
            }
          }))
        }
      },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    // Format response
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      status: job.status,
      createdAt: job.createdAt,
      employerId: job.employerId,
      skills: job.skills.map(js => ({
        id: js.skill.id,
        name: js.skill.name
      }))
    };

    res.status(201).json({
      message: 'Job created successfully',
      job: formattedJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
});

// Update job (employer only)
router.put('/:id', authenticateToken, isEmployer, async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;
    const prisma = req.prisma;

    // Validate request body
    const validation = jobUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input data', 
        errors: validation.error.errors 
      });
    }

    const { title, description, budget, status, skills } = req.body;

    // Check if job exists and belongs to this employer
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        employerId,
        deletedAt: null
      }
    });

    if (!existingJob) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to edit it' });
    }

    // Update job
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (budget !== undefined) updateData.budget = budget;
    if (status !== undefined) updateData.status = status;

    // Update job in transaction with skills if provided
    let updatedJob;
    if (skills && skills.length > 0) {
      updatedJob = await prisma.$transaction(async (tx) => {
        // Delete existing job skills
        await tx.jobSkill.deleteMany({
          where: { jobId: id }
        });

        // Update job
        const job = await tx.job.update({
          where: { id },
          data: {
            ...updateData,
            skills: {
              create: skills.map(skillId => ({
                skill: {
                  connect: { id: skillId }
                }
              }))
            }
          },
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        });

        return job;
      });
    } else {
      updatedJob = await prisma.job.update({
        where: { id },
        data: updateData,
        include: {
          skills: {
            include: {
              skill: true
            }
          }
        }
      });
    }

    // Format response
    const formattedJob = {
      id: updatedJob.id,
      title: updatedJob.title,
      description: updatedJob.description,
      budget: updatedJob.budget,
      status: updatedJob.status,
      createdAt: updatedJob.createdAt,
      updatedAt: updatedJob.updatedAt,
      employerId: updatedJob.employerId,
      skills: updatedJob.skills.map(js => ({
        id: js.skill.id,
        name: js.skill.name
      }))
    };

    res.json({
      message: 'Job updated successfully',
      job: formattedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
});

// Archive job (soft delete)
router.delete('/:id', authenticateToken, isEmployer, async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;
    const prisma = req.prisma;

    // Check if job exists and belongs to this employer
    const job = await prisma.job.findFirst({
      where: {
        id,
        employerId,
        deletedAt: null
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to delete it' });
    }

    // Soft delete (archive) the job
    await prisma.job.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date()
      }
    });

    res.json({ message: 'Job archived successfully' });
  } catch (error) {
    console.error('Error archiving job:', error);
    res.status(500).json({ message: 'Server error while archiving job' });
  }
});

// Get jobs for a specific employer
router.get('/employer/dashboard', authenticateToken, isEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;
    const prisma = req.prisma;

    const jobs = await prisma.job.findMany({
      where: {
        employerId,
        deletedAt: null
      },
      include: {
        applications: {
          select: {
            id: true
          }
        },
        skills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get the employer's last login time
    const employer = await prisma.user.findUnique({
      where: { id: employerId },
      select: { lastLogin: true }
    });

    // Format response
    const formattedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      status: job.status,
      createdAt: job.createdAt,
      skills: job.skills.map(js => ({
        id: js.skill.id,
        name: js.skill.name
      })),
      applicationCount: job.applications.length
    }));

    // Group jobs by status
    const activeJobs = formattedJobs.filter(job => job.status === 'OPEN');
    const closedJobs = formattedJobs.filter(job => job.status === 'CLOSED');
    const archivedJobs = formattedJobs.filter(job => job.status === 'ARCHIVED');

    // Calculate total applications
    const totalApplications = formattedJobs.reduce(
      (total, job) => total + job.applicationCount, 
      0
    );

    res.json({
      jobs: formattedJobs,
      stats: {
        activeJobsCount: activeJobs.length,
        closedJobsCount: closedJobs.length,
        archivedJobsCount: archivedJobs.length,
        totalApplications,
        lastLogin: employer?.lastLogin
      },
      activeJobs,
      closedJobs,
      archivedJobs
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({ message: 'Server error while fetching employer jobs' });
  }
});

module.exports = router;
