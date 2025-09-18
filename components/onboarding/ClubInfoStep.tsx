import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Upload, Mail, Phone, ArrowRight, MapPinHouse, Link, Check, Copy } from 'lucide-react';

interface ClubData {
  name: string;
  logo: string | null;
  contactEmail: string;
  contactPhone: string;
}

interface ClubInfoStepProps {
  data: ClubData;
  onUpdate: (data: ClubData) => void;
  onNext: () => void;
  onSkip: () => void;
}

const ClubInfoStep = ({ data, onUpdate, onNext, onSkip, phone }: ClubInfoStepProps) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://app.example.com/invite/111';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleInputChange = (field: keyof ClubData, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = event => {
        onUpdate({ ...data, logo: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card className="border-0 mt-[250px] shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2 text-team-red" />
          Organization Info
        </CardTitle>
        <p className="text-sm text-gray-600">Set up your organization basic information. This can be updated later in settings.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="clubName" className="text-sm font-medium">
                Organization Name
              </Label>
              <Input
                id="clubName"
                type="text"
                value={data.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="eg: TechStyles"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Organization Logo</Label>
              <div className="mt-1 flex items-center space-x-4">
                {data.logo ? (
                  <img src={data.logo} alt="Club logo" className="w-16 h-16 rounded-lg object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border">
                    <Building className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                Organization Address
              </Label>
              <div className="relative mt-1">
                <Input
                  id="address"
                  type="text"
                  value={data.address}
                  onChange={e => handleInputChange('contactEmail', e.target.value)}
                  placeholder="e.g. 7 Waterhouse Lane , UK"
                  className="pl-10"
                />
                <MapPinHouse className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="contactEmail" className="text-sm font-medium">
                Contact Email
              </Label>
              <div className="relative mt-1">
                <Input
                  id="contactEmail"
                  type="email"
                  value={data.contactEmail}
                  onChange={e => handleInputChange('contactEmail', e.target.value)}
                  placeholder="contact@org.com"
                  className="pl-10"
                />
                <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <Label htmlFor="contactPhone" className="text-sm font-medium">
                Contact Phone
              </Label>
              <div className="relative mt-1">
                <Input
                  id="contactPhone"
                  type="tel"
                  value={phone.phone}
                  onChange={e => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  readOnly
                />
                <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            {/* Invitation */}
            <div>
              <Label htmlFor="contactPhone" className="text-sm mb-2 block font-medium">
                Invite Link
              </Label>
              <div className="bg-[#f2f2f2] border rounded-lg px-4 py-2 flex items-center gap-3 group hover:bg-gray-100 transition-colors">
                <Link className="w-4 h-4 text-gray-500" />

                <span className="text-gray-600 flex-1 font-mono text-sm truncate">{inviteLink}</span>
                <a
                  onClick={handleCopy}
                  className="flex cursor-pointer items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 " />
                      <span className="">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onSkip}>
              Skip for Now
            </Button>

            <Button type="submit" className="bg-black text-white flex items-center">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClubInfoStep;
