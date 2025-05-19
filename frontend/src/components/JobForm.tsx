import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { toast } from './ui/sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useJobs } from '@/hooks/useJobs';
import { Skill } from '@/types/jobs';

interface JobFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    budget: number;
    skills: string[];
  }) => void;
  isLoading?: boolean;
  initialData?: {
    title?: string;
    description?: string;
    budget?: number;
    skills?: string[];
  };
}

// Zod validation schema
const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.number().positive('Budget must be a positive number'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
});

const JobForm: React.FC<JobFormProps> = ({ onSubmit, isLoading = false, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  const { availableSkills, skillFetchError } = useJobs();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setBudget(Number(initialData.budget) || 0);
      setSelectedSkillIds(initialData.skills || []);
    }
  }, [initialData]);

  const toggleSkill = (id: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      title,
      description,
      budget,
      skills: selectedSkillIds,
    };

    const result = jobSchema.safeParse(data);

    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Full Stack Developer"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Briefly describe the job requirements..."
          required
        />
      </div>

      <div>
        <Label htmlFor="budget">Budget (USD)</Label>
        <Input
          id="budget"
          type="number"
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          min="0"
          required
        />
      </div>

      <div>
        <Label>Required Skills</Label>
        {skillFetchError && (
          <p className="text-red-600 text-sm mb-2">{skillFetchError}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-2">
          {availableSkills.length === 0 ? (
            <p className="text-sm text-gray-500">No skills available.</p>
          ) : (
            availableSkills.map((skill: Skill) => (
              <button
                key={skill.id}
                type="button"
                className={`px-3 py-1 rounded-full border text-sm transition ${
                  selectedSkillIds.includes(skill.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
                onClick={() => toggleSkill(skill.id)}
              >
                {skill.name}
              </button>
            ))
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Job'}
      </Button>
    </form>
  );
};

export default JobForm;
