
import React, { useState } from 'react';
import { Job, AVAILABLE_SKILLS, Skill } from '@/hooks/useJobs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckIcon, X } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { 
  Command, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem 
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';


interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: Omit<Job, 'id' | 'createdAt' | 'employerId' | 'employerName'>) => Promise<void>;
  isLoading: boolean;
}
console.log(AVAILABLE_SKILLS)

const JobForm: React.FC<JobFormProps> = ({ 
  initialData = {}, 
  onSubmit,
  isLoading
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [budget, setBudget] = useState(initialData.budget?.toString() || '');
  const [skills, setSkills] = useState<Skill[]>(initialData.skills || []);
  const [status, setStatus] = useState<'open' | 'closed' | 'archived'>(initialData.status || 'open');
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const validate = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!budget) errors.budget = 'Budget is required';
    else if (isNaN(Number(budget)) || Number(budget) <= 0) {
      errors.budget = 'Budget must be a positive number';
    }
    if (skills.length === 0) errors.skills = 'At least one skill is required';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const jobData = {
      title,
      description,
      budget: Number(budget),
      skills,
      status,
    };
    
    await onSubmit(jobData);
  };
  
  const handleSkillSelect = (skill: Skill) => {
    if (!skills.some(s => s.id === skill.id)) {
      setSkills([...skills, skill]);
      // Clear validation error if present
      if (validationErrors.skills) {
        setValidationErrors({ ...validationErrors, skills: '' });
      }
    }
    setIsSkillsOpen(false);
  };
  console.log(AVAILABLE_SKILLS)
  const handleSkillRemove = (skillId: string) => {
    setSkills(skills.filter(s => s.id !== skillId));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Job Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., React Developer Needed for E-commerce Project"
          className={validationErrors.title ? 'border-red-500' : ''}
        />
        {validationErrors.title && (
          <p className="text-red-500 text-sm">{validationErrors.title}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Job Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the project, requirements, and expectations..."
          className={`min-h-[120px] ${validationErrors.description ? 'border-red-500' : ''}`}
        />
        {validationErrors.description && (
          <p className="text-red-500 text-sm">{validationErrors.description}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="budget">Budget ($)</Label>
        <Input
          id="budget"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g., 2500"
          min="0"
          className={validationErrors.budget ? 'border-red-500' : ''}
        />
        {validationErrors.budget && (
          <p className="text-red-500 text-sm">{validationErrors.budget}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="skills">Required Skills</Label>
        <div>
          <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="outline" 
                className={`w-full justify-start border-dashed ${validationErrors.skills ? 'border-red-500' : ''}`}
              >
                {skills.length > 0 
                  ? `${skills.length} skill${skills.length > 1 ? 's' : ''} selected`
                  : 'Select required skills'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-50" align="start">
              <Command>
                <CommandInput placeholder="Search skills..." />
                <CommandEmpty>No skills found.</CommandEmpty>
                <CommandGroup heading="Available Skills" className="max-h-64 overflow-y-auto">
                  {AVAILABLE_SKILLS.map((skill) => {
                    const isSelected = skills.some(s => s.id === skill.id);
                    return (
                     <CommandItem
                                        key={skill.id}
                                        value={skill.name.toLowerCase()} // Convert to lowercase
                                        onSelect={() => handleSkillSelect(skill)}
                                        className="flex items-center justify-between"
                                      >
                                        {skill.name}
                                        {isSelected && (
                                          <CheckIcon className="h-4 w-4" />
                                        )}
                                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {validationErrors.skills && (
            <p className="text-red-500 text-sm mt-1">{validationErrors.skills}</p>
          )}
        </div>
        
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <Badge 
                key={skill.id} 
                className="bg-blue-50 text-blue-800 hover:bg-blue-100"
              >
                {skill.name}
                <button 
                  type="button"
                  className="ml-1 hover:text-blue-900" 
                  onClick={() => handleSkillRemove(skill.id)}
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      
      {initialData.id && (
        <div className="space-y-2">
          <Label htmlFor="status">Job Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'open' | 'closed' | 'archived')}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      )}
      
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full bg-brand-blue hover:bg-brand-darkBlue"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : initialData.id ? 'Update Job' : 'Post Job'}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;