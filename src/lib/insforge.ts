import { createClient } from '@insforge/sdk'

const API_BASE = 'https://fa8w7x4s.eu-central.insforge.app'
const ANON_KEY = 'ik_dd0454cd7355adf83391ed28cb7b5655'

export const insforge = createClient({
  baseUrl: API_BASE,
  anonKey: ANON_KEY,
})

export const API_URL = 'https://fa8w7x4s.eu-central.insforge.app'
export const EDGE_FUNCTIONS_URL = 'https://fa8w7x4s.functions.insforge.app'
export { API_BASE, ANON_KEY }
