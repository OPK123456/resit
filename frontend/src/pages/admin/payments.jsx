import { useState } from 'react'
import AdminLayout from './adminlayout.jsx'
import './payments.css'

const money = (value) => `GH₵ ${Number(value).toFixed(2)}`

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const todayString = () => new Date().toISOString().slice(0, 10)

const METHODS = ['Mobile Money', 'Card', 'Bank Transfer', 'Cash']
const PERIOD = '2025/2026 First Semester Resit'

const initialPayments = [
  { id: 1, reference: 'RSP-20261112-001', indexNumber: '1000001', studentName: 'Ama Mensah', period: PERIOD, courses: ['MA201'], amount: 150, method: 'Mobile Money', date: '2026-11-12', status: 'Successful', receiptNumber: 'RCP-0001' },
  { id: 2, reference: 'RSP-20261112-002', indexNumber: '1000002', studentName: 'Kwame Owusu', period: PERIOD, courses: ['CS201'], amount: 150, method: 'Card', date: '2026-11-12', status: 'Successful', receiptNumber: 'RCP-0002' },
  { id: 3, reference: 'RSP-20261113-001', indexNumber: '1000003', studentName: 'Akosua Boateng', period: PERIOD, courses: ['BA302'], amount: 150, method: 'Mobile Money', date: '2026-11-13', status: 'Pending', receiptNumber: '' },
  { id: 4, reference: 'RSP-20261114-001', indexNumber: '1000004', studentName: 'Kofi Asante', period: PERIOD, courses: ['MA201', 'CS202'], amount: 300, method: 'Bank Transfer', date: '2026-11-14', status: 'Pending', receiptNumber: '' },
  { id: 5, reference: 'RSP-20261115-001', indexNumber: '1000005', studentName: 'Efua Appiah', period: PERIOD, courses: ['CS201'], amount: 150, method: 'Card', date: '2026-11-15', status: 'Failed', receiptNumber: '' },
  { id: 6, reference: 'RSP-20261116-001', indexNumber: '1000006', studentName: 'Yaw Darko', period: PERIOD, courses: ['IT301'], amount: 150, method: 'Cash', date: '2026-11-16', status: 'Successful', receiptNumber: 'RCP-0003' },
  { id: 7, reference: 'RSP-20261117-001', indexNumber: '1000007', studentName: 'Abena Sarpong', period: PERIOD, courses: ['CS201'], amount: 150, method: 'Mobile Money', date: '2026-11-17', status: 'Pending', receiptNumber: '' },
]

const statusClass = {
  Successful: 'status-success',
  Pending: 'status-pending',
  Failed: 'pay-failed',
}

// Next receipt number, e.g. RCP-0004, based on the highest one issued so far
const nextReceiptNumber = (payments) => {
  const highest = payments.reduce((max, p) => {
    const n = Number(p.receiptNumber.replace('RCP-', ''))
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 0)
  return `RCP-${String(highest + 1).padStart(4, '0')}`
}

function Payments() {
  const [payments, setPayments] = useState(initialPayments)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [method, setMethod] = useState('All')
  const [receipt, setReceipt] = useState(null)

  const filtered = payments.filter(
    (p) =>
      (status === 'All' || p.status === status) &&
      (method === 'All' || p.method === method) &&
      `${p.reference} ${p.indexNumber} ${p.studentName}`
        .toLowerCase()
        .includes(search.toLowerCase())
  )

  const sumOf = (s) =>
    payments.filter((p) => p.status === s).reduce((total, p) => total + p.amount, 0)
  const countOf = (s) => payments.filter((p) => p.status === s).length

  const handleVerify = (payment) => {
    if (
      !window.confirm(
        `Confirm that ${money(payment.amount)} from ${payment.studentName} was received?\nA receipt will be issued.`
      )
    )
      return

    setPayments(
      payments.map((p) =>
        p.id === payment.id
          ? {
              ...p,
              status: 'Successful',
              date: todayString(),
              receiptNumber: nextReceiptNumber(payments),
            }
          : p
      )
    )
  }

  const handleReject = (payment) => {
    if (window.confirm(`Mark ${payment.reference} as failed?`)) {
      setPayments(
        payments.map((p) => (p.id === payment.id ? { ...p, status: 'Failed' } : p))
      )
    }
  }

  return (
    <AdminLayout>
      <div className="admin-content payments-page">
        <div className="payments-header">
          <div>
            <h1>Payments</h1>
            <p>Verify resit payments and issue receipts.</p>
          </div>
        </div>

        <div className="payments-stats">
          <div className="pay-stat-card">
            <span>Total Collected</span>
            <h2>{money(sumOf('Successful'))}</h2>
            <small>{countOf('Successful')} successful payments</small>
          </div>
          <div className="pay-stat-card">
            <span>Awaiting Verification</span>
            <h2>{money(sumOf('Pending'))}</h2>
            <small>{countOf('Pending')} pending payments</small>
          </div>
          <div className="pay-stat-card">
            <span>Failed</span>
            <h2>{countOf('Failed')}</h2>
            <small>{money(sumOf('Failed'))} not received</small>
          </div>
        </div>

        <div className="admin-panel">
          <div className="payments-toolbar">
            <input
              type="text"
              placeholder="Search by reference, index number or student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search payments"
            />

            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="All">All statuses</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by method">
              <option value="All">All methods</option>
              {METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>REFERENCE</th>
                  <th>STUDENT</th>
                  <th>COURSES</th>
                  <th>AMOUNT</th>
                  <th>METHOD</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.reference}</strong></td>
                      <td>
                        {p.studentName}
                        <span className="pay-index"> {p.indexNumber}</span>
                      </td>
                      <td>{p.courses.join(', ')}</td>
                      <td>{money(p.amount)}</td>
                      <td>{p.method}</td>
                      <td>{formatDate(p.date)}</td>
                      <td>
                        <span className={`status-badge ${statusClass[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="pay-actions">
                        {p.status === 'Pending' && (
                          <>
                            <button className="pay-verify-btn" onClick={() => handleVerify(p)}>
                              Verify
                            </button>
                            <button className="pay-reject-btn" onClick={() => handleReject(p)}>
                              Reject
                            </button>
                          </>
                        )}
                        {p.status === 'Successful' && (
                          <button className="pay-receipt-btn" onClick={() => setReceipt(p)}>
                            Receipt
                          </button>
                        )}
                        {p.status === 'Failed' && <span className="pay-none">-</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="payments-empty">No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="payments-footer">
            Showing {filtered.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {receipt && (
        <div className="pay-modal-overlay" onClick={() => setReceipt(null)}>
          <div
            className="pay-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Payment receipt"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="receipt-sheet">
              <div className="receipt-top">
                <h2>Payment Receipt</h2>
                <p>Sunyani Technical University</p>
                <small>Resit Registration System</small>
              </div>

              <div className="receipt-number">{receipt.receiptNumber}</div>

              <dl className="receipt-details">
                <div><dt>Student</dt><dd>{receipt.studentName}</dd></div>
                <div><dt>Index number</dt><dd>{receipt.indexNumber}</dd></div>
                <div><dt>Resit period</dt><dd>{receipt.period}</dd></div>
                <div><dt>Courses</dt><dd>{receipt.courses.join(', ')}</dd></div>
                <div><dt>Payment method</dt><dd>{receipt.method}</dd></div>
                <div><dt>Reference</dt><dd>{receipt.reference}</dd></div>
                <div><dt>Date paid</dt><dd>{formatDate(receipt.date)}</dd></div>
              </dl>

              <div className="receipt-total">
                <span>Amount paid</span>
                <strong>{money(receipt.amount)}</strong>
              </div>

              <p className="receipt-note">
                This receipt confirms that the payment above has been received and verified.
              </p>
            </div>

            <div className="pay-modal-actions">
              <button className="pay-close-btn" onClick={() => setReceipt(null)}>
                Close
              </button>
              <button className="admin-primary-button" onClick={() => window.print()}>
                Print receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default Payments