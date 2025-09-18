import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Trash2, ArrowRight } from 'lucide-react';

interface Team {
  name: string;
  ageGroup: string;
  sport: string;
  color: string;
}

interface TeamsStepProps {
  data: Team[];
  onUpdate: (data: Team[]) => void;
  onNext: () => void;
  onSkip: () => void;
}

const TeamsStep = ({ data, onUpdate, onNext, onSkip }: TeamsStepProps) => {
  const [newTeam, setNewTeam] = useState<Team>({
    name: '',
    ageGroup: '',
    sport: 'Football',
    color: '#DC2626',
  });

  const ageGroups = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U21', 'Senior'];

  const sports = ['Football', 'Basketball', 'Tennis', 'Rugby', 'Cricket', 'Hockey', 'Baseball', 'Volleyball'];

  const teamColors = [
    { name: 'Red', value: '#DC2626' },
    { name: 'Blue', value: '#2563EB' },
    { name: 'Green', value: '#16A34A' },
    { name: 'Purple', value: '#9333EA' },
    { name: 'Orange', value: '#EA580C' },
    { name: 'Yellow', value: '#CA8A04' },
    { name: 'Pink', value: '#DB2777' },
    { name: 'Black', value: '#1F2937' },
  ];

  const addTeam = () => {
    if (newTeam.name.trim() && newTeam.ageGroup) {
      onUpdate([...data, newTeam]);
      setNewTeam({ name: '', ageGroup: '', sport: 'Football', color: '#DC2626' });
    }
  };

  const removeTeam = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-team-red" />
          Link Xero
        </CardTitle>
        <p className="text-sm text-gray-600">Connect your initial Xero account.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing teams */}
        {/* {data.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Created Teams</h4>
            {data.map((team, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }}></div>
                  <div>
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-gray-600">
                      {team.ageGroup} • {team.sport}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeTeam(index)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )} */}

        {/* Add new team */}
        {/* <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="font-medium text-sm mb-3 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Team Name</Label>
              <Input
                value={newTeam.name}
                onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                placeholder="Lions"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Age Group</Label>
              <Select value={newTeam.ageGroup} onValueChange={value => setNewTeam({ ...newTeam, ageGroup: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>
                <SelectContent>
                  {ageGroups.map(age => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Sport</Label>
              <Select value={newTeam.sport} onValueChange={value => setNewTeam({ ...newTeam, sport: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sports.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {sport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Team Color</Label>
              <div className="mt-1 flex space-x-2">
                {teamColors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${newTeam.color === color.value ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewTeam({ ...newTeam, color: color.value })}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button onClick={addTeam} className="mt-3 w-full" variant="outline" disabled={!newTeam.name.trim() || !newTeam.ageGroup}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team
          </Button>
        </div> */}

        <div className="flex items-center justify-center">
          <Button type="button" variant="outline">
            Connect Now
          </Button>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onSkip}>
            Skip for Now
          </Button>

          <Button onClick={onNext} className="bg-black text-white flex items-center">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamsStep;
