// Server data helpers — use direct fetch to API routes

export interface BusinessData {
  id: string
  userId: string
  name: string
  phone: string | null
  address: string | null
  websiteUrl: string | null
  industry: string | null
  createdAt: string
}

export interface SiteData {
  id: string
  businessId: string
  subdomain: string
  published: boolean
  generatedHtml: string | null
  createdAt: string
}

export interface LeadData {
  id: string
  businessId: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  source: string | null
  createdAt: string
  businessName?: string
}

export interface LocationData extends BusinessData {
  sites: SiteData[]
  leadCount: number
}

export async function getBusinessData(): Promise<{ business: BusinessData | null; site: SiteData | null }> {
  try {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    const biz = data.businesses?.[0]
    if (!biz) return { business: null, site: null }
    // Fetch site for this business
    const siteRes = await fetch(`/api/sites?businessId=${biz.id}`)
    const siteData = await siteRes.json()
    return { business: biz, site: Array.isArray(siteData) ? siteData[0] : null }
  } catch {
    return { business: null, site: null }
  }
}

export async function getAllLocations(): Promise<{ locations: LocationData[] }> {
  try {
    const res = await fetch('/api/auth/me')
    const data = await res.json()
    const businesses = data.businesses || []
    const locations = await Promise.all(
      businesses.map(async (biz: any) => {
        const siteRes = await fetch(`/api/sites?businessId=${biz.id}`)
        const sites = await siteRes.json()
        const leadsRes = await fetch(`/api/leads?businessId=${biz.id}`)
        const leads = await leadsRes.json()
        return { ...biz, sites: Array.isArray(sites) ? sites : [], leadCount: Array.isArray(leads) ? leads.length : 0 }
      })
    )
    return { locations }
  } catch {
    return { locations: [] }
  }
}

export async function getLeadsData(opts: { businessId: string; source?: string }): Promise<{ leads: LeadData[] }> {
  try {
    let url = `/api/leads?businessId=${opts.businessId}`
    if (opts.source) url += `&source=${opts.source}`
    const res = await fetch(url)
    const leads = await res.json()
    return { leads: Array.isArray(leads) ? leads : [] }
  } catch {
    return { leads: [] }
  }
}

export async function getAllLeadsData(): Promise<{ leads: LeadData[] }> {
  try {
    const locRes = await getAllLocations()
    const allLeads: LeadData[] = []
    for (const loc of locRes.locations) {
      const res = await fetch(`/api/leads?businessId=${loc.id}`)
      const leads = await res.json()
      if (Array.isArray(leads)) {
        allLeads.push(...leads.map((l: any) => ({ ...l, businessName: loc.name })))
      }
    }
    allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return { leads: allLeads }
  } catch {
    return { leads: [] }
  }
}

export async function createLocation(data: {
  name: string; phone: string; address: string; city: string
  state: string; zip: string; industry: string; services: string[]; description: string
}): Promise<{ success: boolean; business?: any; site?: any; error?: string }> {
  try {
    // Create the business first
    const bizRes = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        address: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
        industry: data.industry,
      }),
    })
    const business = await bizRes.json()
    if (!business.id) return { success: false, error: 'Failed to create business' }

    // Generate website via onboarding complete which handles site generation
    const siteRes = await fetch('/api/onboarding/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId: business.id,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        industry: data.industry,
        services: data.services,
        description: data.description,
        subdomain: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30),
      }),
    })
    const result = await siteRes.json()
    return result.success
      ? { success: true, business: result.business, site: result.site }
      : { success: false, error: result.error || 'Failed to generate website' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}