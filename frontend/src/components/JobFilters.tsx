import React, { useState } from 'react';
import { useJobs } from '@/hooks/useJobs';
import { Skill } from '@/types/jobs';
import { CheckIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';

interface JobFiltersProps {
  onSearch: (term: string) => void;
  onSkillsChange: (skills: Skill[]) => void;
  selectedSkills: Skill[];
}

const JobFilters: React.FC<JobFiltersProps> = ({
  onSearch,
  onSkillsChange,
  selectedSkills,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  const { availableSkills } = useJobs();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleSkillSelect = (skill: Skill) => {
    if (!selectedSkills.some((s) => String(s.id) === String(skill.id))) {
      const newSkills = [...selectedSkills, skill];
      onSkillsChange(newSkills);
    }
    setIsSkillsOpen(false);
  };

  const handleSkillRemove = (skillId: string) => {
    onSkillsChange(selectedSkills.filter((s) => String(s.id) !== String(skillId)));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    onSearch('');
    onSkillsChange([]);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by title or keyword..."
            className="w-full"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-dashed border-gray-300"
            >
              {selectedSkills.length > 0
                ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`
                : 'Select skills'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search skills..." />
              <CommandEmpty>No skills found.</CommandEmpty>
              <CommandGroup heading="Available Skills" className="max-h-64 overflow-y-auto">
                {(availableSkills || []).map((skill) => {
                  const isSelected = selectedSkills.some((s) => String(s.id) === String(skill.id));
                  return (
                    <CommandItem
                      key={skill.id}
                      value={skill.name}
                      onSelect={() => handleSkillSelect(skill)}
                      className="flex items-center justify-between"
                    >
                      {skill.name}
                      {isSelected && <CheckIcon className="h-4 w-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {(searchTerm || selectedSkills.length > 0) && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="w-full sm:w-auto"
          >
            Clear filters
          </Button>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSkills.map((skill) => (
            <Badge
              key={skill.id}
              className="bg-blue-50 text-blue-800 hover:bg-blue-100"
            >
              {skill.name}
              <button
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
  );
};

export default JobFilters;