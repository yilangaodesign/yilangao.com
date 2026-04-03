'use client'

import React, { useCallback, useEffect, useState } from 'react'
import styles from './CompanyDashboard.module.scss'

type Company = {
  id: string
  name: string
  slug: string
  password: string
  active: boolean
  accent: string
  greeting: string
  layoutVariant: string
  caseStudyNotes: Array<{ projectSlug: string; note: string; id?: string }>
  lastLoginAt: string | null
  loginCount: number
}

type FormData = {
  name: string
  slug: string
  password: string
  active: boolean
  accent: string
  greeting: string
  layoutVariant: string
  caseStudyNotes: Array<{ projectSlug: string; note: string }>
}

const EMPTY_FORM: FormData = {
  name: '',
  slug: '',
  password: '',
  active: true,
  accent: '#888888',
  greeting: 'Welcome',
  layoutVariant: 'centered',
  caseStudyNotes: [],
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'

function generatePassword(slug: string): string {
  const year = new Date().getFullYear()
  return `${slug}-preview-${year}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function CompanyDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const fetchCompanies = useCallback(async () => {
    try {
      const res = await fetch('/api/companies?limit=100&sort=name')
      const data = await res.json()
      setCompanies(
        (data.docs || []).map((doc: Record<string, unknown>) => ({
          id: doc.id,
          name: doc.name,
          slug: doc.slug,
          password: doc.password,
          active: doc.active ?? true,
          accent: doc.accent || '#888888',
          greeting: doc.greeting || 'Welcome',
          layoutVariant: doc.layoutVariant || 'centered',
          caseStudyNotes: (doc.caseStudyNotes as Company['caseStudyNotes']) || [],
          lastLoginAt: (doc.lastLoginAt as string) || null,
          loginCount: (doc.loginCount as number) || 0,
        })),
      )
    } catch {
      showToast('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  const handleToggleActive = async (company: Company) => {
    try {
      await fetch(`/api/companies/${company.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !company.active }),
      })
      await fetchCompanies()
      showToast(`${company.name} ${company.active ? 'deactivated' : 'activated'}`)
    } catch {
      showToast('Failed to update')
    }
  }

  const handleDelete = async (company: Company) => {
    try {
      await fetch(`/api/companies/${company.id}`, { method: 'DELETE' })
      setDeleteConfirm(null)
      await fetchCompanies()
      showToast(`${company.name} deleted`)
    } catch {
      showToast('Failed to delete')
    }
  }

  const handleCopyUrl = (company: Company) => {
    const text = `URL: ${SITE_URL}/for/${company.slug}\nPassword: ${company.password}`
    navigator.clipboard.writeText(text)
    showToast('Copied to clipboard')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      slug: form.slug,
      password: form.password,
      active: form.active,
      accent: form.accent,
      greeting: form.greeting,
      layoutVariant: form.layoutVariant,
      caseStudyNotes: form.caseStudyNotes.filter((n) => n.projectSlug && n.note),
    }

    try {
      if (editing) {
        await fetch(`/api/companies/${editing}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        showToast(`${form.name} updated`)
      } else {
        await fetch('/api/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        showToast(`${form.name} created`)
      }
      setShowForm(false)
      setEditing(null)
      setForm(EMPTY_FORM)
      await fetchCompanies()
    } catch {
      showToast('Failed to save')
    }
  }

  const startEdit = (company: Company) => {
    setForm({
      name: company.name,
      slug: company.slug,
      password: company.password,
      active: company.active,
      accent: company.accent,
      greeting: company.greeting,
      layoutVariant: company.layoutVariant,
      caseStudyNotes: company.caseStudyNotes.map((n) => ({
        projectSlug: n.projectSlug,
        note: n.note,
      })),
    })
    setEditing(company.id)
    setShowForm(true)
  }

  const startCreate = () => {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(true)
  }

  const addNote = () => {
    setForm((prev) => ({
      ...prev,
      caseStudyNotes: [...prev.caseStudyNotes, { projectSlug: '', note: '' }],
    }))
  }

  const removeNote = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      caseStudyNotes: prev.caseStudyNotes.filter((_, i) => i !== idx),
    }))
  }

  const updateNote = (idx: number, field: 'projectSlug' | 'note', value: string) => {
    setForm((prev) => ({
      ...prev,
      caseStudyNotes: prev.caseStudyNotes.map((n, i) =>
        i === idx ? { ...n, [field]: value } : n,
      ),
    }))
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading companies…</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <nav className={styles.breadcrumb}>
        <a href="/admin" className={styles.breadcrumbLink}>Dashboard</a>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>Company Access</span>
      </nav>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Company Access</h1>
          <p className={styles.subtitle}>
            Manage password-gated access for hiring managers.{' '}
            {companies.length} {companies.length === 1 ? 'company' : 'companies'} configured.
          </p>
        </div>
        <button type="button" className={styles.primaryBtn} onClick={startCreate}>
          + Add Company
        </button>
      </div>

      {showForm && (
        <div className={styles.formOverlay}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <h2>{editing ? 'Edit Company' : 'Add Company'}</h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
              >
                ×
              </button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setForm((prev) => ({
                      ...prev,
                      name,
                      slug: editing ? prev.slug : slugify(name),
                    }))
                  }}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Slug</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                  pattern="[a-z0-9-]+"
                  title="Lowercase letters, numbers, and hyphens only"
                />
              </label>

              <label className={styles.field}>
                <span>Password</span>
                <div className={styles.passwordRow}>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className={styles.genBtn}
                    onClick={() =>
                      setForm((prev) => ({ ...prev, password: generatePassword(prev.slug || 'co') }))
                    }
                  >
                    Generate
                  </button>
                </div>
              </label>

              <label className={styles.field}>
                <span>Accent Color</span>
                <div className={styles.colorRow}>
                  <input
                    type="color"
                    value={form.accent}
                    onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                  />
                  <input
                    type="text"
                    value={form.accent}
                    onChange={(e) => setForm((prev) => ({ ...prev, accent: e.target.value }))}
                    pattern="#[0-9a-fA-F]{6}"
                    className={styles.colorText}
                  />
                </div>
              </label>

              <label className={styles.field}>
                <span>Greeting</span>
                <input
                  type="text"
                  value={form.greeting}
                  onChange={(e) => setForm((prev) => ({ ...prev, greeting: e.target.value }))}
                />
              </label>

              <label className={styles.field}>
                <span>Layout</span>
                <select
                  value={form.layoutVariant}
                  onChange={(e) => setForm((prev) => ({ ...prev, layoutVariant: e.target.value }))}
                  className={styles.select}
                >
                  <option value="centered">Centered Card</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Active</span>
                <div className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  />
                  <span className={styles.checkLabel}>Accepting logins</span>
                </div>
              </label>
            </div>

            <div className={styles.notesSection}>
              <div className={styles.notesSectionHeader}>
                <h3>Case Study Notes</h3>
                <button type="button" className={styles.addNoteBtn} onClick={addNote}>
                  + Add Note
                </button>
              </div>
              {form.caseStudyNotes.map((note, idx) => (
                <div key={idx} className={styles.noteRow}>
                  <input
                    type="text"
                    placeholder="Project slug"
                    value={note.projectSlug}
                    onChange={(e) => updateNote(idx, 'projectSlug', e.target.value)}
                  />
                  <textarea
                    placeholder="Why this matters to the company…"
                    value={note.note}
                    onChange={(e) => updateNote(idx, 'note', e.target.value)}
                    rows={2}
                  />
                  <button
                    type="button"
                    className={styles.removeNoteBtn}
                    onClick={() => removeNote(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.primaryBtn}>
                {editing ? 'Save Changes' : 'Create Company'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirm && (
        <div className={styles.formOverlay}>
          <div className={styles.deleteDialog}>
            <h3>Delete company?</h3>
            <p>
              This permanently removes the company and its login access.
              Existing sessions will expire naturally.
            </p>
            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => {
                  const co = companies.find((c) => c.id === deleteConfirm)
                  if (co) handleDelete(co)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {companies.length === 0 ? (
        <div className={styles.empty}>
          <p>No companies configured yet.</p>
          <button type="button" className={styles.primaryBtn} onClick={startCreate}>
            Add your first company
          </button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Logins</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((co) => (
                <tr key={co.id} className={!co.active ? styles.inactive : undefined}>
                  <td>
                    <div className={styles.companyCell}>
                      <span
                        className={styles.accentDot}
                        style={{ backgroundColor: co.accent }}
                      />
                      {co.name}
                    </div>
                  </td>
                  <td className={styles.mono}>/for/{co.slug}</td>
                  <td>
                    <button
                      type="button"
                      className={`${styles.statusBadge} ${co.active ? styles.active : styles.deactivated}`}
                      onClick={() => handleToggleActive(co)}
                      title={co.active ? 'Click to deactivate' : 'Click to activate'}
                    >
                      {co.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className={styles.meta}>{formatDate(co.lastLoginAt)}</td>
                  <td className={styles.meta}>{co.loginCount}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleCopyUrl(co)}
                        title="Copy URL + password"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => startEdit(co)}
                        title="Edit company"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.danger}`}
                        onClick={() => setDeleteConfirm(co.id)}
                        title="Delete company"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
