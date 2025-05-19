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
    skills?: string[]; // assume array of skill IDs or names depending on your backend
  };
}

const JobForm: React.FC<JobFormProps> = ({ onSubmit, isLoading = false, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState<number>(0);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillsFromDB, setSkillsFromDB] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axios.get('/api/skills');
        setSkillsFromDB(response.data); // expected to be Skill[]
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      }
    };

    fetchSkills();
  }, []);

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
    onSubmit({
      title,
      description,
      budget,
      skills: selectedSkillIds, // send skill IDs
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
          min="0"
          required
        />
      </div>

      <div>
        <Label>Required Skills</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {skillsFromDB.map(skill => (
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
          ))}
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Job'}
      </Button>
    </form>
  );
};

export default JobForm;