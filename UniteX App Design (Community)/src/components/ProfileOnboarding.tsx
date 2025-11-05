import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, GraduationCap, MapPin, Globe, Plus, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

interface ProfileOnboardingProps {
  onComplete: (profileData: any) => void;
  userEmail: string;
}

const departments = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Business Administration',
  'Commerce', 'Arts', 'Science', 'Law', 'Design', 'Other'
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year', 'Graduate'];

const commonSkills = [
  'React', 'JavaScript', 'Python', 'Java', 'C++', 'HTML/CSS', 'Node.js',
  'Machine Learning', 'Data Science', 'UI/UX Design', 'Figma', 'Photoshop',
  'Marketing', 'Content Writing', 'Public Speaking', 'Leadership',
  'Project Management', 'Research', 'Photography', 'Video Editing'
];

export default function ProfileOnboarding({ onComplete, userEmail }: ProfileOnboardingProps) {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    email: userEmail,
    full_name: '',
    username: '',
    department: '',
    year: '',
    bio: '',
    skills: [] as string[],
    website: '',
    location: 'JECRC University',
    avatar_url: ''
  });
  const [customSkill, setCustomSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      if (!profileData.full_name.trim() || !profileData.username.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    if (step === 2) {
      if (!profileData.department || !profileData.year) {
        toast.error('Please select your department and year');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const addSkill = (skill: string) => {
    if (!profileData.skills.includes(skill)) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, skill]
      });
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(s => s !== skill)
    });
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !profileData.skills.includes(customSkill.trim())) {
      addSkill(customSkill.trim());
      setCustomSkill('');
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Generate username from email if not provided
      if (!profileData.username.trim()) {
        const emailUsername = userEmail.split('@')[0];
        profileData.username = emailUsername;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please verify your email first');
        return;
      }

      // Create profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: userEmail,
          full_name: profileData.full_name,
          username: profileData.username,
          department: profileData.department,
          year_of_study: parseInt(profileData.year.split(' ')[0]) || 1,
          bio: profileData.bio || null,
          skills: profileData.skills,
          portfolio_url: profileData.website || null,
          is_faculty: false,
          account_status: 'active'
        });

      if (error) {
        console.error('Profile creation error:', error);
        toast.error('Failed to create profile. Please try again.');
        return;
      }

      toast.success('Profile created successfully!');
      
      // Wait a moment for the toast to show, then complete
      setTimeout(() => {
        onComplete(profileData);
      }, 1000);
    } catch (error) {
      console.error('Profile completion error:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-6"
      >
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? 'dark:bg-blue-500 light:bg-red-600' : 'dark:bg-zinc-700 light:bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">Step {step} of 4</span>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to UniteX!</h1>
              <p className="text-muted-foreground">Let's set up your profile</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Your full name"
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    className="pl-12 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Username *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    placeholder="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                    className="pl-8 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={userEmail}
                    disabled
                    className="pl-12 h-12 opacity-60"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Academic Info */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Academic Details</h1>
              <p className="text-muted-foreground">Tell us about your studies</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Department *</label>
                <select
                  value={profileData.department}
                  onChange={(e) => setProfileData({...profileData, department: e.target.value})}
                  className="w-full h-12 px-3 rounded-md border dark:bg-zinc-900 dark:border-zinc-700 light:bg-white light:border-gray-300 text-foreground"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Year *</label>
                <select
                  value={profileData.year}
                  onChange={(e) => setProfileData({...profileData, year: e.target.value})}
                  className="w-full h-12 px-3 rounded-md border dark:bg-zinc-900 dark:border-zinc-700 light:bg-white light:border-gray-300 text-foreground"
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Your location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="pl-12 h-12"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Bio & Website */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">About You</h1>
              <p className="text-muted-foreground">Share more about yourself</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Bio</label>
                <Textarea
                  placeholder="Tell others about yourself, your interests, and what you're looking for..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="min-h-[100px] resize-none"
                  maxLength={160}
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {profileData.bio.length}/160
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Website (Optional)</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="https://yourwebsite.com"
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    className="pl-12 h-12"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Skills */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Your Skills</h1>
              <p className="text-muted-foreground">Add skills to help others find you</p>
            </div>

            <div className="space-y-4">
              {/* Selected Skills */}
              {profileData.skills.length > 0 && (
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Selected Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map(skill => (
                      <Badge
                        key={skill}
                        className="dark:bg-blue-500/10 light:bg-red-50 dark:text-blue-400 light:text-red-600 dark:border-blue-500/20 light:border-red-200 cursor-pointer"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Custom Skill */}
              <div>
                <label className="text-sm text-muted-foreground">Add Custom Skill</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter a skill"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomSkill()}
                    className="flex-1"
                  />
                  <Button onClick={addCustomSkill} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Common Skills */}
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Popular Skills</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {commonSkills.filter(skill => !profileData.skills.includes(skill)).map(skill => (
                    <Badge
                      key={skill}
                      className="dark:bg-zinc-800 light:bg-gray-100 dark:text-zinc-300 light:text-gray-700 cursor-pointer hover:opacity-80"
                      onClick={() => addSkill(skill)}
                    >
                      {skill} <Plus className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-6">
          {step > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
          )}
          
          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="flex-1 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="flex-1 dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
            >
              {isLoading ? 'Creating Profile...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}