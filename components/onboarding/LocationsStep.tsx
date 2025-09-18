import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Plus, Trash2, ArrowRight, MailQuestion, Loader } from 'lucide-react';

interface Location {
  type: 'office' | 'training' | 'match';
  address: string;
  name: string;
}

interface LocationsStepProps {
  data: Location[];
  onUpdate: (data: Location[]) => void;
  onNext: () => void;
  onSkip: () => void;
}

const LocationsStep = ({ data, onUpdate, onNext, onSkip }: LocationsStepProps) => {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">Link your email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new location */}
        <div className=" rounded-lg py-4 bg-gray-50">
          <h4 className="font-medium text-sm opacity-70 mb-3 flex items-center">Select your email provider</h4>

          <div className="grid mt-10 grid-cols-1 max-w-[250px] mx-auto gap-5">
            <button
              onClick={() => setIsClicked(true)}
              className="border hover:bg-gray-100 cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center"
            >
              <img className="h-16" src="/images/gmail.png" alt="" />
              <p className="font-medium mt-3 text-sm flex items-start gap-1">
                {isClicked && <Loader size={24} className=" animate-spin" />}
                <span className=""> {isClicked ? 'Waiting for send ssl approval for google' : 'Gmail'}</span>
              </p>
            </button>
            {/* <div className="border hover:bg-gray-100 cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center">
              <img className="h-16" src="/images/outlook.png" alt="" />
              <p className="font-medium mt-3 text-base">Outlook</p>
            </div> */}
            {/* <div className="border hover:bg-gray-100 cursor-pointer rounded-xl p-4 flex flex-col items-center justify-center">
              <MailQuestion size={50} strokeWidth={1.5} />
              <p className="font-medium mt-3 text-base">Others</p>
            </div> */}
          </div>
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

export default LocationsStep;
