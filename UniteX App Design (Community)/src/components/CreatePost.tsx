import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDropzone } from 'react-dropzone'
import { useAuth } from '../contexts/AuthContext'
import { useCreatePost } from '../hooks/usePosts'
import { supabase } from '../lib/supabase'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { X, Upload, Image, Video } from 'lucide-react'

const departments = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'MBA',
  'MCA',
  'Law',
  'Management',
  'Arts & Science'
]

const skillSuggestions = [
  'React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Machine Learning',
  'Data Science', 'UI/UX Design', 'Mobile Development', 'DevOps', 'Cloud Computing'
]

export const CreatePost: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { profile } = useAuth()
  const createPost = useCreatePost()
  const [postType, setPostType] = useState<'idea' | 'project' | 'collaboration' | 'announcement'>('idea')
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [requiredDepartments, setRequiredDepartments] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()

  const onDrop = (acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async (): Promise<{ urls: string[], types: string[] }> => {
    if (uploadedFiles.length === 0) return { urls: [], types: [] }

    setUploading(true)
    const urls: string[] = []
    const types: string[] = []

    try {
      for (const file of uploadedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `post-media/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath)

        urls.push(publicUrl)
        types.push(file.type.startsWith('image/') ? 'image' : 'video')
      }
    } finally {
      setUploading(false)
    }

    return { urls, types }
  }

  const onSubmit = async (data: any) => {
    try {
      const { urls, types } = await uploadFiles()

      const postData = {
        content: data.content,
        post_type: postType,
        ...(postType === 'project' && {
          project_title: data.project_title,
          required_skills: requiredSkills,
          required_departments: requiredDepartments,
          team_size_needed: parseInt(data.team_size_needed) || undefined
        }),
        ...(urls.length > 0 && {
          media_urls: urls,
          media_types: types
        })
      }

      await createPost.mutateAsync(postData)
      onClose?.()
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const addSkill = (skill: string) => {
    if (skill && !requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill))
  }

  const addDepartment = (dept: string) => {
    if (dept && !requiredDepartments.includes(dept)) {
      setRequiredDepartments([...requiredDepartments, dept])
    }
  }

  const removeDepartment = (dept: string) => {
    setRequiredDepartments(requiredDepartments.filter(d => d !== dept))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name}&background=3b82f6&color=fff`}
              alt={profile?.full_name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold">{profile?.full_name}</h3>
              <p className="text-sm text-gray-500">{profile?.department}</p>
            </div>
          </div>

          <div>
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">💡 Idea</SelectItem>
                <SelectItem value="project">🚀 Project</SelectItem>
                <SelectItem value="collaboration">🤝 Collaboration</SelectItem>
                <SelectItem value="announcement">📢 Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {postType === 'project' && (
            <div>
              <Label htmlFor="project_title">Project Title</Label>
              <Input
                id="project_title"
                placeholder="Enter project title..."
                {...register('project_title', { required: 'Project title is required' })}
              />
              {errors.project_title && (
                <p className="text-sm text-red-500 mt-1">{errors.project_title.message as string}</p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              rows={4}
              {...register('content', { required: 'Content is required' })}
            />
            {errors.content && (
              <p className="text-sm text-red-500 mt-1">{errors.content.message as string}</p>
            )}
          </div>

          {(postType === 'project' || postType === 'collaboration') && (
            <>
              <div>
                <Label>Required Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {requiredSkills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X size={14} className="cursor-pointer" onClick={() => removeSkill(skill)} />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add required skills..." />
                  </SelectTrigger>
                  <SelectContent>
                    {skillSuggestions
                      .filter(skill => !requiredSkills.includes(skill))
                      .map((skill) => (
                        <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Required Departments</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {requiredDepartments.map((dept) => (
                    <Badge key={dept} variant="outline" className="flex items-center gap-1">
                      {dept}
                      <X size={14} className="cursor-pointer" onClick={() => removeDepartment(dept)} />
                    </Badge>
                  ))}
                </div>
                <Select onValueChange={addDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add required departments..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter(dept => !requiredDepartments.includes(dept))
                      .map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team_size_needed">Team Size Needed</Label>
                <Input
                  id="team_size_needed"
                  type="number"
                  min="1"
                  max="20"
                  placeholder="How many people do you need?"
                  {...register('team_size_needed')}
                />
              </div>
            </>
          )}

          <div>
            <Label>Media</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {isDragActive ? 'Drop files here...' : 'Drag & drop images/videos, or click to select'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Max 50MB per file</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <Image size={16} className="text-blue-500" />
                      ) : (
                        <Video size={16} className="text-green-500" />
                      )}
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={createPost.isPending || uploading}
              className="flex-1"
            >
              {createPost.isPending || uploading ? 'Posting...' : 'Post'}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}