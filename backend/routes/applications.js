
const express = require('express');
const { authenticateToken, isFreelancer, isEmployer, rateLimitApplications } = require('../middleware/auth');
const router = express.Router();
const { z } = require('zod');

// Validation schema for application
const applicationSchema = z.object({
  message: z.string().min(10).max(1000)
});

// Apply to job (freelancer only)
router.post('/jobs/:jobId', authenticateToken, isFreelancer, rateLimitApplications, async (req, res) => {
  try {
    const { jobId } = req.params;
    const freelancerId = req.user.id;
    const { message } = req.body;
    const prisma = req.prisma;

    // Validate request body
    const validation = applicationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        message: 'Invalid input data', 
        errors: validation.error.errors 
      });
    }

    // Check if job exists and is open
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: 'OPEN',
        deletedAt: null
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or not accepting applications' });
    }

    // Check if freelancer has already applied to this job
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId,
        freelancerId
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        message,
        jobId,
        freelancerId
      },
      include: {
        job: {
          select: {
            title: true,
            status: true
          }
        },
        freelancer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        message: application.message,
        createdAt: application.createdAt,
        job: {
          id: jobId,
          title: application.job.title,
          status: application.job.status
        },
        freelancer: {
          id: freelancerId,
          name: application.freelancer.name,
          email: application.freelancer.email
        }
      }
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({ message: 'Server error while submitting application' });
  }
});

// Get all applications for a specific job (employer only)
router.get('/jobs/:jobId', authenticateToken, isEmployer, async (req, res) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.id;
    const prisma = req.prisma;

    // Check if job exists and belongs to this employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        employerId,
        deletedAt: null
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found or you do not have permission to view applications' });
    }

    // Get applications for this job
    const applications = await prisma.application.findMany({
      where: {
        jobId
      },
      include: {
        freelancer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response
    const formattedApplications = applications.map(app => ({
      id: app.id,
      message: app.message,
      createdAt: app.createdAt,
      freelancerId: app.freelancerId,
      freelancerName: app.freelancer.name,
      freelancerEmail: app.freelancer.email
    }));

    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ message: 'Server error while fetching job applications' });
  }
});

// Get all applications for the current freelancer
router.get('/freelancer/dashboard', authenticateToken, isFreelancer, async (req, res) => {
  try {
    const freelancerId = req.user.id;
    const prisma = req.prisma;

    // Get all applications for this freelancer
    const applications = await prisma.application.findMany({
      where: {
        freelancerId
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            employer: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response
    const formattedApplications = applications.map(app => ({
      id: app.id,
      message: app.message,
      createdAt: app.createdAt,
      job: {
        id: app.job.id,
        title: app.job.title,
        status: app.job.status,
        createdAt: app.job.createdAt,
        employerId: app.job.employer.id,
        employerName: app.job.employer.name
      }
    }));

    // Get active applications (open jobs)
    const activeApplications = formattedApplications.filter(
      app => app.job.status === 'OPEN'
    );

    res.json({
      applications: formattedApplications,
      stats: {
        totalApplications: formattedApplications.length,
        activeApplications: activeApplications.length
      }
    });
  } catch (error) {
    console.error('Error fetching freelancer applications:', error);
    res.status(500).json({ message: 'Server error while fetching freelancer applications' });
  }
});

module.exports = router;
