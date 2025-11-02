import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

const signInSchema = z.object({
  email: z.string().email().endsWith('@jecrcu.edu.in', 'Must be a JECRC email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const signUpSchema = signInSchema.extend({
  full_name: z.string().min(2, 'Full name is required'),
  department: z.string().min(1, 'Department is required'),
  user_type: z.enum(['student', 'faculty']),
  student_id: z.string().optional(),
  employee_id: z.string().optional(),
  course: z.string().optional(),
  year_of_study: z.number().optional(),
  designation: z.string().optional()
})

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

export const AuthForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()

  const signInForm = useForm({
    resolver: zodResolver(signInSchema)
  })

  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema)
  })

  const userType = signUpForm.watch('user_type')

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(data.email, data.password)
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setIsLoading(true)
    setError('')

    try {
      const userData = {
        full_name: data.full_name,
        department: data.department,
        is_faculty: data.user_type === 'faculty',
        ...(data.user_type === 'student' && {
          student_id: data.student_id,
          course: data.course,
          year_of_study: data.year_of_study
        }),
        ...(data.user_type === 'faculty' && {
          employee_id: data.employee_id,
          designation: data.designation
        })
      }

      const { error } = await signUp(data.email, data.password, userData)
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">UniteX</CardTitle>
          <CardDescription>JECRC Digital Ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div>
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.name@jecrcu.edu.in"
                    {...signInForm.register('email')}
                  />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {signInForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    {...signInForm.register('password')}
                  />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {signInForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    placeholder="Your full name"
                    {...signUpForm.register('full_name')}
                  />
                  {signUpForm.formState.errors.full_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {signUpForm.formState.errors.full_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.name@jecrcu.edu.in"
                    {...signUpForm.register('email')}
                  />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    {...signUpForm.register('password')}
                  />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="user_type">I am a</Label>
                  <Select onValueChange={(value) => signUpForm.setValue('user_type', value as 'student' | 'faculty')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={(value) => signUpForm.setValue('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userType === 'student' && (
                  <>
                    <div>
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        placeholder="Your student ID"
                        {...signUpForm.register('student_id')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="course">Course</Label>
                      <Input
                        id="course"
                        placeholder="B.Tech CSE, MBA, etc."
                        {...signUpForm.register('course')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="year_of_study">Year of Study</Label>
                      <Select onValueChange={(value) => signUpForm.setValue('year_of_study', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userType === 'faculty' && (
                  <>
                    <div>
                      <Label htmlFor="employee_id">Employee ID</Label>
                      <Input
                        id="employee_id"
                        placeholder="Your employee ID"
                        {...signUpForm.register('employee_id')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        placeholder="Professor, HOD, etc."
                        {...signUpForm.register('designation')}
                      />
                    </div>
                  </>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}