'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
} from '@mui/material'
import {
  User,
  Calendar,
  Rocket,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  X,
  Building2,
} from 'lucide-react'

const steps = [
  { label: 'Getting Started', icon: User },
  { label: 'Availabilities', icon: Calendar },
  { label: 'Profile Boost', icon: Rocket },
]

interface ClientData {
  id: string
  token: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  headline: string | null
  location: string | null
  positions: Position[]
  currentStep: number
  isOnboarded: boolean
}

interface Position {
  id: string
  companyName: string
  companyLogo: string | null
  title: string
  startDate: string | null
  endDate: string | null
  isCurrent: boolean
}

export default function OnboardingPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(true)
  const [client, setClient] = useState<ClientData | null>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadClient()
  }, [params.token])

  async function loadClient() {
    try {
      const res = await fetch(`/api/tailoredsolutions/${params.token}`)
      if (!res.ok) {
        if (res.status === 404) {
          setError('Invalid or expired link')
        } else {
          setError('Failed to load profile')
        }
        return
      }
      const data = await res.json()
      setClient(data)
      setActiveStep(data.currentStep || 0)
    } catch (e) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  async function updateStep(step: number) {
    if (!client) return
    
    try {
      await fetch(`/api/tailoredsolutions/${params.token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentStep: step }),
      })
      setActiveStep(step)
    } catch (e) {
      console.error('Failed to update step:', e)
    }
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  if (error || !client) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <X size={48} color="#ef4444" style={{ marginBottom: 16 }} />
            <Typography variant="h6" color="error">
              {error || 'Something went wrong'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              This link may be invalid or expired.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (client.isOnboarded) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 5 }}>
            <CheckCircle2 size={48} color="#22c55e" style={{ marginBottom: 16 }} />
            <Typography variant="h6">
              You're all set!
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Your profile has been completed. We'll be in touch soon.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 2 }}>
        <Container maxWidth="md">
          <Typography variant="h6" fontWeight={600}>
            Tailored Solutions
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Progress */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Getting Started */}
        {activeStep === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Welcome, {client.firstName || 'there'}!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                We've pre-populated your profile from LinkedIn. Please review and confirm your details.
              </Typography>

              {/* Personal Details */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1', md: '2' }, gap: 2, mb: 4 }}>
                <TextField
                  label="First Name"
                  defaultValue={client.firstName || ''}
                />
                <TextField
                  label="Last Name"
                  defaultValue={client.lastName || ''}
                />
                <TextField
                  label="Email"
                  defaultValue={client.email || ''}
                />
                <TextField
                  label="Phone"
                  defaultValue={client.phone || ''}
                />
                <TextField
                  label="Headline"
                  defaultValue={client.headline || ''}
                  fullWidth
                  gridColumn="span 2"
                />
                <TextField
                  label="Location"
                  defaultValue={client.location || ''}
                  fullWidth
                  gridColumn="span 2"
                />
              </Box>

              {/* Work History */}
              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                Work History
              </Typography>
              {client.positions?.map((position, idx) => (
                <Card
                  key={position.id}
                  variant="outlined"
                  sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Avatar
                    src={position.companyLogo || undefined}
                    variant="rounded"
                    sx={{ width: 48, height: 48, bgcolor: '#f0f0f0' }}
                  >
                    <Building2 size={24} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={600}>
                      {position.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {position.companyName}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {position.startDate} — {position.endDate}
                    </Typography>
                  </Box>
                  {position.isCurrent && (
                    <Chip label="Current" size="small" color="primary" />
                  )}
                </Card>
              ))}

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  endIcon={<ArrowRight />}
                  onClick={() => updateStep(1)}
                >
                  Continue to Availabilities
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Availabilities */}
        {activeStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your Availability
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Tell us when you're available for consultations.
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                Availability form coming soon...
              </Typography>

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  startIcon={<ArrowLeft />}
                  onClick={() => updateStep(0)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowRight />}
                  onClick={() => updateStep(2)}
                >
                  Continue to Profile Boost
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Profile Boost */}
        {activeStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Profile Boost
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Add any additional details to enhance your expert profile.
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                Additional profile fields coming soon...
              </Typography>

              {/* Navigation */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  startIcon={<ArrowLeft />}
                  onClick={() => updateStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={() => updateStep(3)} // Marks complete
                >
                  Complete Profile
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}
