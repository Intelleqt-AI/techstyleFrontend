import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Building, Users, MapPin, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClubData {
  name: string;
  logo: string | null;
  contactEmail: string;
  contactPhone: string;
}

interface CompletionStepProps {
  clubData: ClubData;
  onComplete: () => void;
}

const CompletionStep = ({ clubData, onComplete }: CompletionStepProps) => {
  return (
    <Card className="border-0 mt-[200px] shadow-none">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Welcome to TechStyles!</CardTitle>
        <p className="text-gray-600">Your organization has been successfully set up </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Club summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-4 mb-4">
            {clubData.logo ? (
              <img src={clubData.logo} alt="Club logo" className="w-16 h-16 rounded-lg object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{clubData.name || 'Your Club'}</h3>
              <p className="text-gray-600">Ready to manage</p>
            </div>
          </div>
        </div>

        {/* Next steps */}
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">What's Next?</h4>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <h5 className="font-medium text-blue-900">Add Players to Teams</h5>
                <p className="text-sm text-blue-700">Start adding players to your teams and organize your squads.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h5 className="font-medium text-green-900">Schedule Events</h5>
                <p className="text-sm text-green-700">Create training sessions, matches, and other team events.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
              <UserPlus className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <h5 className="font-medium text-purple-900">Invite Parents & Players</h5>
                <p className="text-sm text-purple-700">Send invitations to parents and players to join your club.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Complete button */}
        <div className="pt-4">
          <button
            onClick={() => onComplete()}
            className="w-full bg-black rounded-lg text-white text-md py-2 flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          <p className="text-center text-sm text-gray-500 mt-3">You can always access these settings later from the dashboard.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionStep;
