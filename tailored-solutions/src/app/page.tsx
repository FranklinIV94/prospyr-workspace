import Link from 'next/link'
import { Box, Button, Typography, Container } from '@mui/material'
import { ArrowRight, Users, Zap, Shield } from 'lucide-react'

export default function Home() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box
        sx={{
          py: 15,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Tailored Solutions
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Expert onboarding, reimagined
          </Typography>
          <Button
            component={Link}
            href="/admin"
            variant="contained"
            size="large"
            endIcon={<ArrowRight />}
            sx={{
              bgcolor: 'white',
              color: '#667eea',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
            }}
          >
            Go to Admin
          </Button>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1', md: '3' }, gap: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Zap size={40} color="#667eea" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Pre-Populated Data
            </Typography>
            <Typography color="text.secondary">
              Automatically enrich client profiles from LinkedIn before they even start.
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Users size={40} color="#667eea" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Seamless Onboarding
            </Typography>
            <Typography color="text.secondary">
              Multi-step flow with progress saving. Confirm details, not type from scratch.
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Shield size={40} color="#667eea" style={{ marginBottom: 16 }} />
            <Typography variant="h6" gutterBottom>
              Secure & Private
            </Typography>
            <Typography color="text.secondary">
              Token-based access. No login required. Enterprise-grade data protection.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
