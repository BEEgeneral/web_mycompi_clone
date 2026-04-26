import { createClient } from '@insforge/sdk'

const API_BASE = 'https://guuimyx3.eu-central.insforge.app'
const ANON_KEY = 'ik_448e7387f3c4b7f16764bb092b4a84b2'

export const insforge = createClient({
  baseUrl: API_BASE,
  anonKey: ANON_KEY,
})

export const API_URL = 'https://guuimyx3.eu-central.insforge.app'
export const EDGE_FUNCTIONS_URL = 'https://guuimyx3.functions.insforge.app'
export { API_BASE, ANON_KEY }
