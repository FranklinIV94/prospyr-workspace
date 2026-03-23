import axios from 'axios'

const APOLLO_API_KEY = process.env.APOLLO_API_KEY
const APOLLO_BASE_URL = 'https://api.apollo.io/api/v1'

interface ApolloPerson {
  id: string
  first_name: string
  last_name: string
  name: string
  headline: string
  linkedin_url: string
  location: string | null
  email: string | null
  phone_number: string | null
  organization: {
    name: string
    logo_url: string | null
  } | null
  previous_organizations: {
    name: string
    logo_url: string | null
  }[]
}

export async function getEnrichedProfile(linkedinUrl: string) {
  // 1. Find person by LinkedIn URL
  const searchRes = await axios.post(
    `${APOLLO_BASE_URL}/people/match`,
    {
      api_key: APOLLO_API_KEY,
      linkedin_url: linkedinUrl,
    },
    { headers: { 'Content-Type': 'application/json' } }
  )

  if (!searchRes.data.person) {
    throw new Error('Person not found')
  }

  const person: ApolloPerson = searchRes.data.person

  // Build positions array
  const positions: any[] = []

  // Current position
  if (person.organization) {
    positions.push({
      companyName: person.organization.name,
      companyLogo: person.organization.logo_url,
      title: person.headline || '',
      startDate: '',
      endDate: 'Present',
      isCurrent: true,
      sortOrder: 0,
    })
  }

  // Previous positions
  person.previous_organizations?.forEach((org, idx) => {
    positions.push({
      companyName: org.name,
      companyLogo: org.logo_url,
      title: '', // Apollo doesn't always give titles for past roles
      startDate: '',
      endDate: '',
      isCurrent: false,
      sortOrder: idx + 1,
    })
  })

  return {
    firstName: person.first_name,
    lastName: person.last_name,
    headline: person.headline,
    location: person.location,
    linkedinUrl: person.linkedin_url,
    email: person.email,
    phone: person.phone_number,
    positions,
  }
}

// Alternative: Search by name + company
export async function searchByNameCompany(name: string, companyDomain: string) {
  const searchRes = await axios.post(
    `${APOLLO_BASE_URL}/mixed_people/search`,
    {
      api_key: APOLLO_API_KEY,
      q_keywords: name,
      organization_name: companyDomain,
      page: 1,
      per_page: 10,
    },
    { headers: { 'Content-Type': 'application/json' } }
  )

  return searchRes.data.people || []
}
