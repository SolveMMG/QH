import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface Skill {
  id: string;
  name: string;
}

interface JobFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: {
    title?: string;
    description?: string;
    budget?: number;
    skills?: (string | Skill)[] | string | Skill; // allow single string or object too
  };
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit, isLoading = false, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillsFromDB, setSkillsFromDB] = useState<Skill[]>([]);
  const [didInit, setDidInit] = useState(false);

  // Debug log to check initialData.skills shape
  useEffect(() => {
    console.log('initialData.skills:', initialData?.skills);
    if (initialData?.skills && !Array.isArray(initialData.skills)) {
      console.warn('Warning: initialData.skills is not an array!', initialData.skills);
    }
  }, [initialData]);

  // Initialize form fields and normalize skills from initialData safely
  useEffect(() => {
    if (!didInit && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setBudget(Number(initialData.budget) || 0);

      let safeSkills: string[] = [];

      if (initialData.skills) {
        if (Array.isArray(initialData.skills)) {
          safeSkills = initialData.skills.map(s => (typeof s === 'string' ? s : s.id));
        } else if (typeof initialData.skills === 'string') {
          safeSkills = [initialData.skills];
        } else if (typeof initialData.skills === 'object' && initialData.skills.id) {
          safeSkills = [initialData.skills.id];
        }
      }

      setSelectedSkillIds(safeSkills);
      setDidInit(true);
    }
  }, [initialData, didInit]);

  // Fetch skills from API, either filtered by selected ids or all
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        if (initialData?.skills) {
          let ids: string[] = [];

          if (Array.isArray(initialData.skills)) {
            ids = initialData.skills.map(s => (typeof s === 'string' ? s : s.id));
          } else if (typeof initialData.skills === 'string') {
            ids = [initialData.skills];
          } else if (typeof initialData.skills === 'object' && initialData.skills.id) {
            ids = [initialData.skills.id];
          }

          if (ids.length > 0) {
            const queryParam = ids.join(',');
            const response = await axios.get(`/api/skills?ids=${queryParam}`);
            setSkillsFromDB(response.data);
            return;
          }
        }
        // fallback to fetching all skills if no initial skills
        const response = await axios.get('/api/skills');
        setSkillsFromDB(response.data);
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };

    fetchSkills();
  }, [initialData]);

  const toggleSkill = (id: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      budget,
      skills: selectedSkillIds,
    });
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
          min={0}
          required
        />
      </div>

      <div>
        <Label>Required Skills</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.isArray(skillsFromDB) && skillsFromDB.length > 0 ? (
            skillsFromDB.map(skill => (
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
          ) : (
            <p className="text-sm text-red-500">Skills could not be loaded.</p>
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
