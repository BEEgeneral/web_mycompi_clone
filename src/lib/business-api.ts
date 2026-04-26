// Business API - Conecta con business-core edge function
import { EDGE_FUNCTIONS_URL } from './insforge'

export interface Lead {
  id?: string
  name: string
  email: string
  source: string
  interest_level: string
  score: number
  status?: string
  agent?: string
  nextFollowUp?: string
  createdAt?: string
}

export interface Invoice {
  id?: string
  invoiceNumber: string
  client_name: string
  items: Array<{ description: string; quantity: number; unit_price: number }>
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  issueDate?: string
}

export interface Opportunity {
  id?: string
  title: string
  value: number
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closing' | 'won' | 'lost'
  probability: number
  client_name: string
  createdAt?: string
}

export interface BusinessMetrics {
  mrr: number
  arr: number
  pipelineValue: number
  overdueInvoices: number
  activeLeads: number
  activeClients: number
  wonOpportunities: number
  totalInvoices: number
  paidInvoices: number
}

export async function getBusinessMetrics(companyId: string): Promise<{ metrics: BusinessMetrics }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/business-core`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_metrics', company_id: companyId })
  })
  return res.json()
}

export async function getLeads(companyId: string): Promise<{ leads: Lead[] }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/business-core`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'get_leads', company_id: companyId })
  })
  return res.json()
}

export async function createLead(companyId: string, lead: Omit<Lead, 'id' | 'score' | 'agent'>): Promise<{ success: boolean; agent: string; score: number }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/business-core`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_lead', company_id: companyId, data: lead })
  })
  return res.json()
}

export async function createInvoice(companyId: string, invoice: {
  client_name: string
  items: Array<{ description: string; quantity: number; unit_price: number }>
  tax_rate?: number
  due_days?: number
  notes?: string
}): Promise<{ success: boolean; invoiceNumber: string; total: number; dueDate: string }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/business-core`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_invoice', company_id: companyId, data: invoice })
  })
  return res.json()
}

export async function recordPayment(companyId: string, payment: {
  invoice_number: string
  amount: number
  method?: string
}): Promise<{ success: boolean }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/business-core`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'record_payment', company_id: companyId, data: payment })
  })
  return res.json()
}

export async function createOpportunity(companyId: string, opp: {
  title: string
  value: number
  stage?: string
  client_name: string
}): Promise<{ success: boolean }> {
  const res = await fetch(`${EDGE_FUNCTIONS_URL}/business-core`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create_opportunity', company_id: companyId, data: opp })
  })
  return res.json()
}