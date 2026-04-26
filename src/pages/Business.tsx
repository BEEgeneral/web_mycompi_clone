import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBusinessMetrics, getLeads, createLead, createInvoice, type Lead, type BusinessMetrics } from '../lib/business-api'
import { getSession } from '../lib/api'

export default function Business() {
  const navigate = useNavigate()
  const session = getSession()
  const companyId = (session?.user as any)?.companyId || (session?.user as any)?.company_id

  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'invoices' | 'opportunities'>('dashboard')
  const [loading, setLoading] = useState(true)

  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadName, setLeadName] = useState('')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadSource, setLeadSource] = useState('web')
  const [leadInterest, setLeadInterest] = useState('medium')

  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [invoiceClient, setInvoiceClient] = useState('')
  const [invoiceItems, setInvoiceItems] = useState([{ description: '', quantity: 1, unit_price: 0 }])
  const [invoiceTax, setInvoiceTax] = useState(21)
  const [invoiceDueDays, setInvoiceDueDays] = useState(30)

  useEffect(() => {
    if (!session) {
      navigate('/login')
      return
    }
    loadData()
  }, [session])

  async function loadData() {
    if (!companyId) return
    setLoading(true)
    try {
      const [metricsRes, leadsRes] = await Promise.all([
        getBusinessMetrics(companyId),
        getLeads(companyId)
      ])
      setMetrics(metricsRes.metrics)
      setLeads(leadsRes.leads || [])
    } catch (e) {
      console.error('Error loading business data:', e)
    }
    setLoading(false)
  }

  async function handleCreateLead(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    try {
      await createLead(companyId, { name: leadName, email: leadEmail, source: leadSource, interest_level: leadInterest })
      setShowLeadForm(false)
      setLeadName('')
      setLeadEmail('')
      setLeadSource('web')
      setLeadInterest('medium')
      loadData()
    } catch (e) {
      console.error('Error creating lead:', e)
    }
  }

  function updateInvoiceItem(index: number, field: string, value: string | number) {
    const items = [...invoiceItems]
    if (field === 'description') items[index].description = value as string
    if (field === 'quantity') items[index].quantity = value as number
    if (field === 'unit_price') items[index].unit_price = value as number
    setInvoiceItems(items)
  }

  function addInvoiceItem() {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId) return
    try {
      await createInvoice(companyId, { client_name: invoiceClient, items: invoiceItems, tax_rate: invoiceTax, due_days: invoiceDueDays })
      setShowInvoiceForm(false)
      setInvoiceClient('')
      setInvoiceItems([{ description: '', quantity: 1, unit_price: 0 }])
      loadData()
    } catch (e) {
      console.error('Error creating invoice:', e)
    }
  }

  function getScoreColor(score: number) {
    if (score >= 70) return 'text-green-600 bg-green-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  function getScoreLabel(score: number) {
    if (score >= 70) return 'Hot'
    if (score >= 40) return 'Warm'
    return 'Cold'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-indigo-900 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Business Center</h1>
            <p className="text-indigo-200 text-sm">{(session?.user as any)?.company || 'Mi Empresa'}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-200 hover:text-white">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {(['dashboard', 'leads', 'invoices', 'opportunities'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && metrics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">MRR</p>
                <p className="text-3xl font-bold text-indigo-600">{metrics.mrr.toFixed(0)} EUR</p>
                <p className="text-xs text-gray-400">Monthly recurring revenue</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">Pipeline</p>
                <p className="text-3xl font-bold text-green-600">{metrics.pipelineValue.toFixed(0)} EUR</p>
                <p className="text-xs text-gray-400">Opportunities value</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">Active Leads</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.activeLeads}</p>
                <p className="text-xs text-gray-400">In follow-up</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <p className="text-gray-500 text-sm">Overdue</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.overdueInvoices}</p>
                <p className="text-xs text-gray-400">Need action</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="flex gap-3">
                <button onClick={() => setShowLeadForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                  + New Lead
                </button>
                <button onClick={() => setShowInvoiceForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                  + New Invoice
                </button>
              </div>
            </div>

            {showLeadForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-md">
                  <h3 className="font-bold text-lg mb-4">New Lead</h3>
                  <form onSubmit={handleCreateLead} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input required value={leadName} onChange={e => setLeadName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Lead name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input required type="email" value={leadEmail} onChange={e => setLeadEmail(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                        <select value={leadSource} onChange={e => setLeadSource(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                          <option value="web">Web</option>
                          <option value="referral">Referral</option>
                          <option value="inbound">Inbound</option>
                          <option value="cold">Cold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest</label>
                        <select value={leadInterest} onChange={e => setLeadInterest(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Create Lead</button>
                      <button type="button" onClick={() => setShowLeadForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showInvoiceForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                  <h3 className="font-bold text-lg mb-4">New Invoice</h3>
                  <form onSubmit={handleCreateInvoice} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                      <input required value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Line Items</label>
                      {invoiceItems.map((item, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input required placeholder="Description" value={item.description} onChange={e => updateInvoiceItem(i, 'description', e.target.value)} className="flex-1 px-3 py-2 border rounded-lg text-sm" />
                          <input required type="number" placeholder="Qty" value={item.quantity} onChange={e => updateInvoiceItem(i, 'quantity', parseFloat(e.target.value))} className="w-20 px-2 py-2 border rounded-lg text-sm" />
                          <input required type="number" placeholder="Price" value={item.unit_price} onChange={e => updateInvoiceItem(i, 'unit_price', parseFloat(e.target.value))} className="w-24 px-2 py-2 border rounded-lg text-sm" />
                        </div>
                      ))}
                      <button type="button" onClick={addInvoiceItem} className="text-sm text-indigo-600 hover:underline">+ Add line</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500">Tax %</label>
                        <input type="number" value={invoiceTax} onChange={e => setInvoiceTax(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Due days</label>
                        <input type="number" value={invoiceDueDays} onChange={e => setInvoiceDueDays(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Create Invoice</button>
                      <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Leads ({leads.length})</h3>
              <button onClick={() => setShowLeadForm(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">+ New Lead</button>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {leads.map((lead, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{lead.source}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${lead.interest_level === 'urgent' ? 'bg-red-100 text-red-700' : lead.interest_level === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                        {lead.interest_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getScoreColor(lead.score)}`}>
                        {lead.score} — {getScoreLabel(lead.score)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{lead.agent || 'paco'}</td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No leads yet. Create your first lead!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-center text-gray-500 py-12">
              Invoices - use API to create and track
            </p>
          </div>
        )}

        {activeTab === 'opportunities' && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-center text-gray-500 py-12">
              Opportunities pipeline - coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}