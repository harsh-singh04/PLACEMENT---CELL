/* =============================================
   DATA STORE — shared via localStorage
   ============================================= */

const DEFAULT_DRIVES = [
  {
    id: 1,
    company: 'Google',
    role: 'Software Engineer',
    type: 'Full-time',
    ctc: '28 LPA',
    location: 'Hyderabad',
    status: 'open',
    deadline: '2026-05-10',
    cgpa: '7.5',
    batch: '2026',
    skills: ['DSA', 'System Design', 'Python'],
    desc: 'Google is hiring SWE for its Cloud division. Expect 4 rounds including DSA, system design, and HR. Strong problem-solving skills required.'
  },
  {
    id: 2,
    company: 'Microsoft',
    role: 'Product Analyst',
    type: 'Full-time',
    ctc: '22 LPA',
    location: 'Bangalore',
    status: 'open',
    deadline: '2026-05-15',
    cgpa: '7.0',
    batch: '2026',
    skills: ['SQL', 'Excel', 'Product Thinking'],
    desc: 'Microsoft Product Analyst role in Bing Search team. Strong analytical and communication skills required.'
  },
  {
    id: 3,
    company: 'Amazon',
    role: 'SDE Intern',
    type: 'Internship',
    ctc: '70k/mo',
    location: 'Pune',
    status: 'upcoming',
    deadline: '2026-06-01',
    cgpa: '6.5',
    batch: '2027',
    skills: ['Java', 'AWS', 'OOPs'],
    desc: '6-month internship in Amazon Retail team. PPO available for top performers. Expect 2 coding rounds and 1 system design round.'
  },
  {
    id: 4,
    company: 'Infosys',
    role: 'Systems Engineer',
    type: 'Full-time',
    ctc: '6.5 LPA',
    location: 'Chennai',
    status: 'open',
    deadline: '2026-04-30',
    cgpa: '6.0',
    batch: '2026',
    skills: ['Any Language', 'Communication'],
    desc: 'Mass hiring for fresh graduates. Includes paid training program. Aptitude test followed by HR round.'
  },
  {
    id: 5,
    company: 'Razorpay',
    role: 'Backend Engineer',
    type: 'Full-time',
    ctc: '18 LPA',
    location: 'Bangalore',
    status: 'closed',
    deadline: '2026-04-01',
    cgpa: '7.5',
    batch: '2026',
    skills: ['Node.js', 'Go', 'Databases'],
    desc: 'Backend engineering role in payments infrastructure team. Focus on scalability and reliability.'
  }
];

// ---- Helpers ----

function getDrives() {
  const saved = localStorage.getItem('pc_drives');
  if (!saved) {
    localStorage.setItem('pc_drives', JSON.stringify(DEFAULT_DRIVES));
    return DEFAULT_DRIVES;
  }
  return JSON.parse(saved);
}

function saveDrives(drives) {
  localStorage.setItem('pc_drives', JSON.stringify(drives));
}

function getApplications() {
  const saved = localStorage.getItem('pc_applications');
  return saved ? JSON.parse(saved) : [];
}

function saveApplications(apps) {
  localStorage.setItem('pc_applications', JSON.stringify(apps));
}

function getNextId() {
  const id = parseInt(localStorage.getItem('pc_next_id') || '6');
  localStorage.setItem('pc_next_id', id + 1);
  return id;
}

function resetData() {
  localStorage.removeItem('pc_drives');
  localStorage.removeItem('pc_applications');
  localStorage.removeItem('pc_next_id');
}
