import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:3001/students'
const emptyStudent = {
  name: '',
  phone: '',
  email: '',
  age: '',
  class: '',
  grade: '',
  image: '',
}

function App() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signedIn, setSignedIn] = useState(
    sessionStorage.getItem('student-manager-signed-in') === 'true',
  )
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('All classes')
  const [sortBy, setSortBy] = useState('name')
  const [studentForm, setStudentForm] = useState(emptyStudent)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activePage, setActivePage] = useState('students')

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Could not load students.')
        setStudents(await response.json())
        setError('')
      } catch {
        setError('Unable to connect to the student server. Start it with "npm run server" and refresh this page.')
      } finally {
        setLoading(false)
      }
    }
    loadStudents()
  }, [])

  const classes = useMemo(
    () => [...new Set(students.map((student) => student.class).filter(Boolean))].sort(),
    [students],
  )

  const visibleStudents = useMemo(() => {
    return students
      .filter((student) => {
        const searchTerm = search.toLowerCase()
        const matchesSearch = [student.name, student.email, student.grade, student.class]
          .some((value) => String(value || '').toLowerCase().includes(searchTerm))
        return matchesSearch && (classFilter === 'All classes' || student.class === classFilter)
      })
      .sort((first, second) => {
        if (sortBy === 'class') return first.class.localeCompare(second.class)
        if (sortBy === 'grade') return first.grade.localeCompare(second.grade)
        return first.name.localeCompare(second.name)
      })
  }, [students, search, classFilter, sortBy])

  function signIn(event) {
    event.preventDefault()
    if (loginEmail === 'admin@school.com' && loginPassword === 'admin123') {
      sessionStorage.setItem('student-manager-signed-in', 'true')
      setSignedIn(true)
      setLoginError('')
    } else {
      setLoginError('Email or password is incorrect. Try the demo account below.')
    }
  }

  function signOut() {
    sessionStorage.removeItem('student-manager-signed-in')
    setSignedIn(false)
    setActivePage('students')
  }

  function openAddForm() {
    setStudentForm(emptyStudent)
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(student) {
    setStudentForm({ ...emptyStudent, ...student })
    setEditingId(student.id)
    setShowForm(true)
  }

  async function saveStudent(event) {
    event.preventDefault()
    const student = {
      ...studentForm,
      age: Number(studentForm.age),
    }
    const url = editingId ? `${API_URL}/${editingId}` : API_URL

    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      })
      if (!response.ok) throw new Error('Could not save student.')
      const savedStudent = await response.json()
      setStudents((current) => editingId
        ? current.map((item) => item.id === editingId ? savedStudent : item)
        : [...current, savedStudent])
      setShowForm(false)
      setError('')
    } catch {
      setError('Could not save student. Check that JSON Server is running, then try again.')
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Delete ${student.name} from the student list?`)) return
    try {
      const response = await fetch(`${API_URL}/${student.id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete student.')
      setStudents((current) => current.filter((item) => item.id !== student.id))
      setError('')
    } catch {
      setError('Could not delete student. Check that JSON Server is running, then try again.')
    }
  }

  if (!signedIn) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={signIn}>
          <div className="brand-mark">S</div>
          <p className="eyebrow">STUDENT MANAGEMENT</p>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to manage your students.</p>
          {loginError && <div className="alert alert-danger py-2">{loginError}</div>}
          <label className="form-label" htmlFor="login-email">Email address</label>
          <input
            className="form-control mb-3"
            id="login-email"
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="you@school.com"
            required
          />
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            className="form-control mb-4"
            id="login-password"
            type="password"
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="Enter your password"
            required
          />
          <button className="btn btn-primary w-100" type="submit">Sign in</button>
          <div className="demo-login">
            <strong>Demo login</strong>
            <span>admin@school.com</span>
            <span>admin123</span>
          </div>
        </form>
      </main>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#students" onClick={() => setActivePage('students')}>
          <span className="brand-mark">S</span>
          <span>scholar<span className="brand-dot">.</span></span>
        </a>
        <p className="nav-caption">MENU</p>
        <button
          className={`side-link ${activePage === 'students' ? 'active' : ''}`}
          onClick={() => setActivePage('students')}
        >
          <span className="nav-icon">▦</span> Students
          <span className="nav-count">{students.length}</span>
        </button>
        <button
          className={`side-link ${activePage === 'profile' ? 'active' : ''}`}
          onClick={() => setActivePage('profile')}
        >
          <span className="nav-icon">◉</span> My profile
        </button>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar avatar-small">AD</div>
            <div><strong>Admin User</strong><span>Administrator</span></div>
          </div>
          <button className="side-link signout-link" onClick={signOut}>
            <span className="nav-icon">↪</span> Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {activePage === 'students' ? 'Students' : 'My profile'}</div>
          <div className="topbar-user"><span className="online-dot" /> School Admin <div className="avatar avatar-small">AD</div></div>
        </header>

        {error && <div className="alert alert-warning api-alert">{error}</div>}

        {activePage === 'students' ? (
          <>
            <section className="page-heading">
              <div>
                <p className="eyebrow">ACADEMIC YEAR 2025–2026</p>
                <h1>Students</h1>
                <p className="muted">Manage your students and keep their information up to date.</p>
              </div>
              <button className="btn btn-primary add-button" onClick={openAddForm}>
                <span>+</span> Add student
              </button>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon purple">♧</div>
                <div><p>Total students</p><strong>{students.length}</strong></div>
                <span className="stat-note">Enrolled</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">▦</div>
                <div><p>Classes</p><strong>{classes.length}</strong></div>
                <span className="stat-note">Active</span>
              </div>
              <div className="stat-card">
                <div className="stat-icon green">✓</div>
                <div><p>Average grade</p><strong>{students.length ? (students.reduce((sum, student) => sum + (Number(student.grade) || 0), 0) / students.length).toFixed(1) : '—'}</strong></div>
                <span className="stat-note">Out of 100</span>
              </div>
            </section>

            <section className="students-panel">
              <div className="panel-heading">
                <div><h2>All students</h2><p className="muted">A list of all students in your school.</p></div>
                <span className="result-count">{visibleStudents.length} students</span>
              </div>
              <div className="filters">
                <div className="search-box">
                  <span>⌕</span>
                  <input
                    aria-label="Search students"
                    placeholder="Search by name, email or grade..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <select className="form-select" aria-label="Filter by class" value={classFilter} onChange={(event) => setClassFilter(event.target.value)}>
                  <option>All classes</option>
                  {classes.map((className) => <option key={className}>{className}</option>)}
                </select>
                <select className="form-select sort-select" aria-label="Sort students" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="name">Sort: Name</option>
                  <option value="class">Sort: Class</option>
                  <option value="grade">Sort: Grade</option>
                </select>
              </div>

              {loading ? (
                <div className="empty-state"><div className="spinner-border text-primary" role="status" /><p>Loading students...</p></div>
              ) : visibleStudents.length ? (
                <div className="table-responsive">
                  <table className="table student-table align-middle">
                    <thead><tr><th>STUDENT</th><th>CLASS</th><th>AGE</th><th>GRADE</th><th>CONTACT</th><th className="text-end">ACTIONS</th></tr></thead>
                    <tbody>
                      {visibleStudents.map((student, index) => (
                        <tr key={student.id}>
                          <td>
                            <div className="student-cell">
                              {student.image ? (
                                <img className="avatar" src={student.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                              ) : <div className={`avatar avatar-color-${index % 5}`}>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</div>}
                              <div><strong>{student.name}</strong><span>{student.email}</span></div>
                            </div>
                          </td>
                          <td><span className="class-pill">{student.class}</span></td>
                          <td>{student.age}</td>
                          <td><span className="grade-value">{student.grade}<small>/100</small></span></td>
                          <td>{student.phone}</td>
                          <td>
                            <div className="table-actions">
                              <button aria-label={`Edit ${student.name}`} title="Edit student" onClick={() => openEditForm(student)}>✎</button>
                              <button className="delete-action" aria-label={`Delete ${student.name}`} title="Delete student" onClick={() => deleteStudent(student)}>⌫</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state"><div className="empty-icon">⌕</div><h3>No students found</h3><p>Try adjusting your search or add a new student.</p></div>
              )}
            </section>
            <footer className="page-footer">© 2025 Scholar Student Management <span>Made for better learning</span></footer>
          </>
        ) : (
          <section className="profile-panel">
            <p className="eyebrow">ACCOUNT</p><h1>My profile</h1>
            <div className="profile-card"><div className="avatar profile-avatar">AD</div><div><h2>Admin User</h2><p>admin@school.com</p><span className="class-pill">Administrator</span></div></div>
            <p className="muted profile-note">You are signed in and can add, update, and delete student records.</p>
          </section>
        )}
      </main>

      {showForm && (
        <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
          <form className="student-modal" onSubmit={saveStudent}>
            <div className="modal-heading">
              <div><p className="eyebrow">{editingId ? 'STUDENT RECORD' : 'NEW ENROLLMENT'}</p><h2>{editingId ? 'Edit student' : 'Add a student'}</h2></div>
              <button type="button" className="close-button" aria-label="Close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-field full-field"><label className="form-label" htmlFor="student-name">Full name *</label><input id="student-name" className="form-control" required value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} placeholder="e.g. Maya Patel" /></div>
              <div className="form-field"><label className="form-label" htmlFor="student-email">Email *</label><input id="student-email" className="form-control" type="email" required value={studentForm.email} onChange={(event) => setStudentForm({ ...studentForm, email: event.target.value })} placeholder="student@school.com" /></div>
              <div className="form-field"><label className="form-label" htmlFor="student-phone">Phone *</label><input id="student-phone" className="form-control" type="tel" required value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value })} placeholder="+1 555 0100" /></div>
              <div className="form-field"><label className="form-label" htmlFor="student-age">Age *</label><input id="student-age" className="form-control" type="number" min="3" max="25" required value={studentForm.age} onChange={(event) => setStudentForm({ ...studentForm, age: event.target.value })} placeholder="Age" /></div>
              <div className="form-field"><label className="form-label" htmlFor="student-class">Class *</label><input id="student-class" className="form-control" required value={studentForm.class} onChange={(event) => setStudentForm({ ...studentForm, class: event.target.value })} placeholder="e.g. Grade 8" /></div>
              <div className="form-field"><label className="form-label" htmlFor="student-grade">Grade *</label><input id="student-grade" className="form-control" type="number" min="0" max="100" required value={studentForm.grade} onChange={(event) => setStudentForm({ ...studentForm, grade: event.target.value })} placeholder="0–100" /></div>
              <div className="form-field"><label className="form-label" htmlFor="student-image">Image URL</label><input id="student-image" className="form-control" type="url" value={studentForm.image} onChange={(event) => setStudentForm({ ...studentForm, image: event.target.value })} placeholder="https://..." /></div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editingId ? 'Save changes' : 'Add student'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default App
