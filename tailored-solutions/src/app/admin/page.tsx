'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
} from '@mui/material'
import { ContentCopy, Send, RefreshCw, Check, X } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getEnrichedProfile } from '@/lib/enrichment'
import { v4 as uuidv4 } from 'uuid'

export default function AdminClients() {
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [clients, setClients] = useState<any[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Load clients on mount
  useState(() => {
    loadClients()
  })

  async function loadClients() {
    try {
      const res = await fetch('/api/admin/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (e) {
      console.error('Failed to load clients:', e)
    }
  }

  async function addClient() {
    if (!linkedinUrl.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      // 1. Create client with token
      const token = uuidv4()
      const createRes = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, linkedinUrl: linkedinUrl.trim() }),
      })

      if (!createRes.ok) throw new Error('Failed to create client')

      // 2. Enrich data
      const enrichRes = await fetch('/api/admin/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, linkedinUrl: linkedinUrl.trim() }),
      })

      if (!enrichRes.ok) {
        setMessage({ type: 'error', text: 'Client created but enrichment failed' })
      } else {
        setMessage({ type: 'success', text: 'Client added and enriched successfully!' })
      }

      setLinkedinUrl('')
      loadClients()
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  async function copyLink(token: string) {
    const url = `${process.env.NEXT_PUBLIC_APP_URL_PROD || 'http://localhost:3000'}/tailoredsolutions/${token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function sendInvite(token: string) {
    try {
      const res = await fetch('/api/admin/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (res.ok) {
        setMessage({ type: 'success', text: 'Invite sent!' })
      } else {
        setMessage({ type: 'error', text: 'Failed to send invite' })
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to send invite' })
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 3, mb: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Manage your expert clients
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Add Client */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Add New Client
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="LinkedIn Profile URL"
                placeholder="https://linkedin.com/in/johndoe"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                onClick={addClient}
                disabled={loading || !linkedinUrl.trim()}
                startIcon={loading ? <RefreshCw className="animate-spin" /> : <Send />}
              >
                {loading ? 'Processing...' : 'Add & Enrich'}
              </Button>
            </Box>
            {message && (
              <Alert
                severity={message.type}
                sx={{ mt: 2 }}
                icon={message.type === 'success' ? <Check /> : <X />}
              >
                {message.text}
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Client List */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Clients ({clients.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Headline</TableCell>
                    <TableCell>Enriched</TableCell>
                    <TableCell>Onboarded</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {clients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary">
                          No clients yet. Add one above.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>
                          {client.firstName} {client.lastName}
                        </TableCell>
                        <TableCell>{client.headline || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={client.isEnriched ? 'Yes' : 'No'}
                            color={client.isEnriched ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={client.isOnboarded ? 'Yes' : 'No'}
                            color={client.isOnboarded ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => copyLink(client.token)}
                            title="Copy link"
                          >
                            {copiedId === client.token ? (
                              <Check size={18} />
                            ) : (
                              <ContentCopy size={18} />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => sendInvite(client.token)}
                            title="Send invite"
                          >
                            <Send size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
