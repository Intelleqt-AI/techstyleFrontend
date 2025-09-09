import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Upload, Bell, Shield, Palette, Globe } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/settings/user/profile');
  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Profile Settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder.svg?height=80&width=80" />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-xl font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input id="firstName" defaultValue="Jane" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input id="lastName" defaultValue="Designer" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input id="email" type="email" defaultValue="jane@techstyles.com" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number
                </Label>
                <Input id="phone" defaultValue="+1 (555) 123-4567" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Email Notifications', description: 'Receive email updates about your projects', enabled: true },
                { title: 'Push Notifications', description: 'Get push notifications on your devices', enabled: true },
                { title: 'Task Reminders', description: 'Reminders for upcoming tasks and deadlines', enabled: true },
                { title: 'Client Updates', description: 'Notifications when clients make changes', enabled: false },
                { title: 'Team Mentions', description: 'When someone mentions you in comments', enabled: true },
              ].map(setting => (
                <div key={setting.title} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-gray-900">{setting.title}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Theme</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-3">
                    <input type="radio" name="theme" value="light" defaultChecked className="text-yellow-500" />
                    <span className="text-sm text-gray-700">Light</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="radio" name="theme" value="dark" className="text-yellow-500" />
                    <span className="text-sm text-gray-700">Dark</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="radio" name="theme" value="system" className="text-yellow-500" />
                    <span className="text-sm text-gray-700">System</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Language & Region</h3>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="language" className="text-sm font-medium text-gray-700">
                  Language
                </Label>
                <select id="language" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>

              <div>
                <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
                  Timezone
                </Label>
                <select id="timezone" className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Eastern Time (ET)</option>
                  <option>Central Time (CT)</option>
                  <option>Mountain Time (MT)</option>
                  <option>Pacific Time (PT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
