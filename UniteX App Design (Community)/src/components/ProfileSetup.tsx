import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { X } from 'lucide-react'

const skillSuggestions = [
  'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Machine Learning',
  'Data Science', 'UI/UX Design', 'Mobile Development', 'DevOps', 'Cloud Computing',
  'Blockchain', 'AI', 'Cybersecurity', 'Database Management', 'Project Management',
  'Digital Marketing', 'Content Writing', 'Graphic Design', 'Video Editing'
]

const interestSuggestions = [
  'Entrepreneurship', 'Innovation', 'Startups', 'Technology', 'Research', 'Sustainability',
  'Social Impact', 'FinTech', 'HealthTech', 'EdTech', 'Gaming', 'IoT', 'Robotics',
  'Virtual Reality', 'Augmented Reality', 'Open Source', 'Community Building'
]

export const ProfileSetup: React.FC = () => {
  const { profile, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [skills, setSkills] = useState<string[]>(profile?.skills || [])
  const [interests, setInterests] = useState<string[]>(profile?.interests || [])
  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      linkedin_url: profile?.linkedin_url || '',
      github_url: profile?.github_url || '',
      portfolio_url: profile?.portfolio_url || ''
    }
  })

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill))
  }

  const addInterest = (interest: string) => {
    if (interest && !interests.includes(interest)) {
      setInterests([...interests, interest])
      setInterestInput('')
    }
  }

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest))
  }

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await updateProfile({
        ...data,
        skills,
        interests
      })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  {...register('bio')}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9876543210"
                  {...register('phone')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    placeholder="https://linkedin.com/in/username"
                    {...register('linkedin_url')}
                  />
                </div>
                <div>
                  <Label htmlFor="github_url">GitHub URL</Label>
                  <Input
                    id="github_url"
                    placeholder="https://github.com/username"
                    {...register('github_url')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="portfolio_url">Portfolio URL</Label>
                <Input
                  id="portfolio_url"
                  placeholder="https://yourportfolio.com"
                  {...register('portfolio_url')}
                />
              </div>

              <div>
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        size={14}
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => removeSkill(skill)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addSkill(skillInput)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSkill(skillInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {skillSuggestions
                    .filter(skill => !skills.includes(skill))
                    .slice(0, 10)
                    .map((skill) => (
                      <Button
                        key={skill}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addSkill(skill)}
                        className="text-xs"
                      >
                        + {skill}
                      </Button>
                    ))}
                </div>
              </div>

              <div>
                <Label>Interests</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {interests.map((interest) => (
                    <Badge key={interest} variant="outline" className="flex items-center gap-1">
                      {interest}
                      <X
                        size={14}
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => removeInterest(interest)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    placeholder="Add an interest..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterest(interestInput)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addInterest(interestInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {interestSuggestions
                    .filter(interest => !interests.includes(interest))
                    .slice(0, 8)
                    .map((interest) => (
                      <Button
                        key={interest}
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addInterest(interest)}
                        className="text-xs"
                      >
                        + {interest}
                      </Button>
                    ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}