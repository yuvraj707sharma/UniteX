import { useState, useRef } from 'react'
import { ArrowLeft, Camera, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { toast } from 'sonner'
import { sanitizeHtml, sanitizeUsername, validateUrl } from '../utils/sanitize'

interface EditProfileProps {
  onBack: () => void
  profile: {
    name: string
    username: string
    bio: string
    avatar: string
    department: string
    year: string
    location: string
    website: string
    skills: string[]
  }
  onSave: (updatedProfile: any) => void
}

export default function EditProfile({ onBack, profile, onSave }: EditProfileProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    username: profile.username,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    avatar: profile.avatar
  })
  const [skills, setSkills] = useState(profile.skills)
  const [skillInput, setSkillInput] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (typeof result === 'string') {
          setAvatarPreview(result)
        }
      }
      reader.onerror = () => {
        toast.error('Failed to read image file')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error handling avatar change:', error)
      toast.error('Failed to process image')
    }
  }

  const addSkill = () => {
    try {
      const trimmedSkill = skillInput.trim()
      if (!trimmedSkill) {
        toast.error('Please enter a skill')
        return
      }
      
      if (skills.includes(trimmedSkill)) {
        toast.error('Skill already added')
        return
      }
      
      if (skills.length >= 10) {
        toast.error('Maximum 10 skills allowed')
        return
      }
      
      setSkills([...skills, trimmedSkill])
      setSkillInput('')
    } catch (error) {
      console.error('Error adding skill:', error)
      toast.error('Failed to add skill')
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handleSave = () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        toast.error('Name is required')
        return
      }
      
      if (!formData.username.trim()) {
        toast.error('Username is required')
        return
      }
      
      // Validate website URL if provided
      if (formData.website.trim() && !validateUrl(formData.website.trim())) {
        toast.error('Please enter a valid website URL');
        return;
      }
      
      // Sanitize input data
      const sanitizedData = {
        name: sanitizeHtml(formData.name.trim()),
        username: sanitizeUsername(formData.username.trim()),
        bio: sanitizeHtml(formData.bio.trim()),
        location: sanitizeHtml(formData.location.trim()),
        website: formData.website.trim()
      }
      
      const updatedProfile = {
        ...profile,
        ...sanitizedData,
        skills: skills.map(skill => skill.trim()),
        avatar: avatarPreview
      }
      
      onSave(updatedProfile)
      toast.success('Profile updated successfully!')
      onBack()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 dark:bg-black/80 light:bg-white/80 backdrop-blur-xl border-b dark:border-zinc-800 light:border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button onClick={onBack}>
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
            <h1 className="text-foreground text-xl">Edit Profile</h1>
          </div>
          <Button 
            onClick={handleSave}
            className="dark:bg-blue-500 dark:hover:bg-blue-600 light:bg-red-600 light:hover:bg-red-700 text-white"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarPreview} />
              <AvatarFallback className="dark:bg-zinc-800 dark:text-white light:bg-gray-200 light:text-black text-2xl">
                {formData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
          <p className="text-muted-foreground text-sm text-center">
            Click the camera icon to change your profile photo
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Username</label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="mt-1"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Bio</label>
            <Textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="mt-1 min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Location</label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="mt-1"
              placeholder="Your location"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Website</label>
            <Input
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="mt-1"
              placeholder="yourwebsite.com"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm font-medium text-foreground">Skills</label>
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button onClick={addSkill} variant="outline">
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}