import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, GraduationCap, CreditCard, LogOut, User, School, Award, 
  PlusCircle, Search, CheckCircle, XCircle, Loader2, Trash2, Edit, Calculator, DollarSign, FileText, Copy, AlertCircle
} from 'lucide-react';

// --- CONFIGURATION ---
const API_GATEWAY = "http://localhost:8081";

// --- TYPES ---
interface Student { _id: string; nom: string; prenom: string; email: string; classe: string; }
interface Course { id: string; nom: string; description: string; salle: string; horaire: string; }
interface Grade { id: string; note: number; coefficient: number; cours_id: string; }
interface Average { moyenne: number; mention: string; nombre_notes: number; }

// --- UTILITAIRES ---
const getXmlValue = (xmlDoc: Document | Element, tagName: string): string => {
  const element = xmlDoc.getElementsByTagName(tagName)[0];
  return element ? element.textContent || "" : "";
};

// Fonction pour vérifier si un étudiant existe (Appel au Service Étudiants)
const checkStudentExists = async (id: string, token: string | null): Promise<boolean> => {
  if (!id || !token) return false;
  try {
    const res = await fetch(`${API_GATEWAY}/api/etudiants/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok; // Renvoie true si 200 OK, false si 404 ou 500
  } catch { return false; }
};

// --- COMPOSANTS PRINCIPAUX ---

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwt_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('user_role'));
  const [activeTab, setActiveTab] = useState('students');

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  if (!token) return <LoginScreen onLogin={(t: string, r: string) => {
    localStorage.setItem('jwt_token', t);
    localStorage.setItem('user_role', r);
    setToken(t);
    setRole(r);
  }} />;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          <School className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-lg font-bold tracking-tight">Univ SOA</h1>
            <span className="text-xs text-slate-400 uppercase tracking-widest">{role || 'Guest'}</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={activeTab === 'students'} onClick={() => setActiveTab('students')} icon={<User />} label="Étudiants" />
          <NavButton active={activeTab === 'grades'} onClick={() => setActiveTab('grades')} icon={<Award />} label="Notes & Moyennes" />
          <NavButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')} icon={<BookOpen />} label="Cours (SOAP)" />
          <NavButton active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} icon={<CreditCard />} label="Facturation (SOAP)" />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={logout} className="flex items-center gap-3 text-red-300 hover:text-white w-full px-4 py-2 rounded transition-colors text-sm">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'students' && 'Gestion Administrative (Node.js)'}
              {activeTab === 'grades' && 'Gestion Académique (Python)'}
              {activeTab === 'courses' && 'Catalogue des Cours (Java)'}
              {activeTab === 'billing' && 'Service Financier (.NET)'}
            </h2>
            <div className="text-xs font-mono bg-white px-3 py-1 rounded border text-slate-500">Gateway: :8081</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] p-6">
            {activeTab === 'students' && <StudentsModule token={token} role={role} />}
            {activeTab === 'grades' && <GradesModule token={token} role={role} />}
            {activeTab === 'courses' && <CoursesModule token={token} role={role} />}
            {activeTab === 'billing' && <BillingModule token={token} role={role} />}
          </div>
        </div>
      </main>
    </div>
  );
}

// --- MODULE 1 : ÉTUDIANTS (CRUD COMPLET + ID) ---
function StudentsModule({ token, role }: { token: string; role: string | null }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchId, setSearchId] = useState('');
  const [newStudent, setNewStudent] = useState({ nom: '', prenom: '', email: '', classe: '' });
  const [editMode, setEditMode] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${API_GATEWAY}/api/etudiants`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_GATEWAY}/api/etudiants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newStudent)
    });
    setNewStudent({ nom: '', prenom: '', email: '', classe: '' });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet étudiant ?")) return;
    await fetch(`${API_GATEWAY}/api/etudiants/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    refresh();
  };

  const handleUpdate = async (id: string, data: Partial<Student>) => {
    await fetch(`${API_GATEWAY}/api/etudiants/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setEditMode(null);
    refresh();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("ID copié : " + text);
  };

  const handleSearch = async () => {
    if (!searchId) return refresh();
    const res = await fetch(`${API_GATEWAY}/api/etudiants/${searchId}`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setStudents([await res.json()]);
    else alert("Étudiant non trouvé");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2 text-sm flex-1" placeholder="Rechercher par ID..." value={searchId} onChange={e => setSearchId(e.target.value)} />
          <button onClick={handleSearch} className="bg-slate-200 px-4 rounded hover:bg-slate-300"><Search size={18} /></button>
          <button onClick={() => { setSearchId(''); refresh(); }} className="text-blue-600 text-sm">Tout voir</button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-medium">
              <tr>
                <th className="px-4 py-3 w-24">ID</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Prénom</th>
                <th className="px-4 py-3">Classe</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(s => (
                <tr key={s._id} className="hover:bg-slate-50">
                  {editMode === s._id ? (
                    <>
                      <td className="p-2 text-xs text-gray-400">{s._id.substring(0,6)}...</td>
                      <td className="p-2"><input defaultValue={s.nom} id={`nom-${s._id}`} className="border w-full p-1 rounded" /></td>
                      <td className="p-2"><input defaultValue={s.prenom} id={`prenom-${s._id}`} className="border w-full p-1 rounded" /></td>
                      <td className="p-2"><input defaultValue={s.classe} id={`classe-${s._id}`} className="border w-full p-1 rounded" /></td>
                      <td className="p-2 text-right">
                        <button onClick={() => handleUpdate(s._id, {
                          nom: (document.getElementById(`nom-${s._id}`) as HTMLInputElement).value,
                          prenom: (document.getElementById(`prenom-${s._id}`) as HTMLInputElement).value,
                          classe: (document.getElementById(`classe-${s._id}`) as HTMLInputElement).value
                        })} className="text-green-600 mr-2 font-bold">OK</button>
                        <button onClick={() => setEditMode(null)} className="text-red-600">X</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <button onClick={() => copyToClipboard(s._id)} className="flex items-center gap-1 text-xs font-mono bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 text-slate-600" title="Copier l'ID complet">
                          {s._id.substring(0, 6)}... <Copy size={10} />
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium">{s.nom}</td>
                      <td className="px-4 py-3">{s.prenom}</td>
                      <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{s.classe}</span></td>
                      <td className="px-4 py-3 text-right space-x-3">
                        {role === 'ADMIN' && (
                          <>
                            <button onClick={() => setEditMode(s._id)} className="text-slate-400 hover:text-blue-600"><Edit size={16} /></button>
                            <button onClick={() => handleDelete(s._id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {role === 'ADMIN' && (
        <div className="bg-slate-50 p-5 rounded-lg border h-fit sticky top-0">
          <h3 className="font-bold mb-4 flex items-center gap-2"><PlusCircle size={18} /> Ajouter Étudiant</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <input className="w-full border rounded p-2 text-sm" placeholder="Nom" required value={newStudent.nom} onChange={e => setNewStudent({...newStudent, nom: e.target.value})} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Prénom" required value={newStudent.prenom} onChange={e => setNewStudent({...newStudent, prenom: e.target.value})} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Email" type="email" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
            <input className="w-full border rounded p-2 text-sm" placeholder="Classe (GL3)" required value={newStudent.classe} onChange={e => setNewStudent({...newStudent, classe: e.target.value})} />
            <button className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">Enregistrer</button>
          </form>
        </div>
      )}
    </div>
  );
}

// --- MODULE 2 : NOTES (AVEC VÉRIFICATION) ---
function GradesModule({ token, role }: { token: string; role: string | null }) {
  const [studentId, setStudentId] = useState('');
  const [average, setAverage] = useState<Average | null>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [newGrade, setNewGrade] = useState({ note: 0, coefficient: 1, cours_id: 'SOA' });
  const [editGradeId, setEditGradeId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setErrorMsg('');
    setAverage(null);
    setStudentGrades([]);
    if (!studentId) return;

    // VÉRIFICATION : L'étudiant existe-t-il ?
    const exists = await checkStudentExists(studentId, token);
    if (!exists) {
      setErrorMsg("❌ Étudiant introuvable dans la base !");
      return;
    }

    try {
      const avgRes = await fetch(`${API_GATEWAY}/api/notes/moyenne/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (avgRes.ok) setAverage(await avgRes.json());
      const listRes = await fetch(`${API_GATEWAY}/api/notes/etudiant/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (listRes.ok) setStudentGrades(await listRes.json());
    } catch (e) { console.error(e); }
  };

  const addGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // VÉRIFICATION AVANT AJOUT
    const exists = await checkStudentExists(studentId, token);
    if (!exists) {
      setErrorMsg("Impossible d'ajouter une note : Étudiant inexistant.");
      return;
    }

    await fetch(`${API_GATEWAY}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...newGrade, etudiant_id: studentId })
    });
    alert("Note ajoutée !");
    fetchData();
  };

  const deleteGrade = async (gradeId: string) => {
    if (!confirm("Supprimer cette note ?")) return;
    await fetch(`${API_GATEWAY}/api/notes/${gradeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const updateGrade = async (gradeId: string, updatedGrade: Partial<Grade>) => {
    await fetch(`${API_GATEWAY}/api/notes/${gradeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(updatedGrade)
    });
    setEditGradeId(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 bg-slate-50 p-4 rounded-lg border flex-col md:flex-row items-start md:items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1">ID Étudiant (Copier depuis l'onglet Étudiants)</label>
          <div className="flex gap-2">
            <input className="flex-1 border rounded p-2 font-mono text-sm" placeholder="ex: 656c..." value={studentId} onChange={e => setStudentId(e.target.value)} />
            <button onClick={fetchData} className="bg-indigo-600 text-white px-4 rounded flex items-center gap-2 text-sm hover:bg-indigo-700"><Search size={16} /> Rechercher</button>
          </div>
        </div>
      </div>

      {errorMsg && <div className="bg-red-100 text-red-700 p-3 rounded flex items-center gap-2"><AlertCircle size={18}/> {errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6 relative overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-4">Bulletin Académique</h3>
          {average ? (
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between border-b pb-2">
                <span>Moyenne</span>
                <span className={`text-2xl font-bold ${average.moyenne >= 10 ? 'text-green-600' : 'text-red-600'}`}>{average.moyenne.toFixed(2)}/20</span>
              </div>
              <div className="flex justify-between"><span>Mention</span><span className="font-medium bg-slate-100 px-2 rounded">{average.mention}</span></div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-500">Détail des notes :</h4>
                <ul className="text-sm space-y-1">
                  {studentGrades.map(g => (
                    <li key={g.id} className="flex justify-between bg-slate-50 p-2 rounded">
                      <span>{g.cours_id}</span>
                      <span className="font-mono">{g.note}/20 <span className="text-xs text-gray-400">(Coeff {g.coefficient})</span></span>
                      {(role === 'ADMIN' || role === 'PROFESSOR') && (
                        <div className="flex gap-1">
                          <button onClick={() => {
                            setEditGradeId(g.id);
                            setNewGrade({ note: g.note, coefficient: g.coefficient, cours_id: g.cours_id });
                          }} className="text-blue-500 hover:text-blue-700 text-xs"><Edit size={14} /></button>
                          <button onClick={() => deleteGrade(g.id)} className="text-red-500 hover:text-red-700 text-xs"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : <div className="text-center text-gray-400 py-10">Saisissez un ID valide pour voir les résultats</div>}
        </div>

        {(role === 'ADMIN' || role === 'PROFESSOR') && (
          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex justify-between items-center">
              {editGradeId ? 'Modifier la note' : 'Ajouter une note'}
              {editGradeId && <button onClick={() => {setEditGradeId(null); setNewGrade({ note: 0, coefficient: 1, cours_id: 'SOA' });}} className="text-xs underline">Annuler</button>}
            </h3>
            <form onSubmit={editGradeId ? (e) => {e.preventDefault(); updateGrade(editGradeId, newGrade);} : addGrade} className="space-y-4">
              <div><label className="text-xs uppercase text-gray-500">Matière</label><input className="w-full border rounded p-2" value={newGrade.cours_id} onChange={e => setNewGrade({...newGrade, cours_id: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs uppercase text-gray-500">Note</label><input type="number" step="0.5" className="w-full border rounded p-2" value={newGrade.note} onChange={e => setNewGrade({...newGrade, note: parseFloat(e.target.value)})} /></div>
                <div><label className="text-xs uppercase text-gray-500">Coeff</label><input type="number" className="w-full border rounded p-2" value={newGrade.coefficient} onChange={e => setNewGrade({...newGrade, coefficient: parseInt(e.target.value)})} /></div>
              </div>
              <button disabled={!studentId} className={`w-full text-white py-2 rounded hover:opacity-90 disabled:opacity-50 ${editGradeId ? 'bg-blue-600' : 'bg-green-600'}`}>
                {editGradeId ? 'Mettre à jour' : 'Ajouter Note'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MODULE 3 : COURS (SOAP + DELETE + UPDATE) ---
function CoursesModule({ token, role }: { token: string; role: string | null }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({ nom: '', description: '', salle: '', horaire: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const executeSOAP = async (body: string) => {
    const res = await fetch(`${API_GATEWAY}/ws/cours`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml', Authorization: `Bearer ${token}` },
      body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="http://service.course.universite.com/"><soapenv:Header/><soapenv:Body>${body}</soapenv:Body></soapenv:Envelope>`
    });
    return res.text();
  };

  const fetchCourses = async () => {
    const text = await executeSOAP(`<tns:getAllCourses/>`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/xml");
    const nodes = doc.getElementsByTagName("return");
    setCourses(Array.from(nodes).map(n => ({
      id: getXmlValue(n, "id"),
      nom: getXmlValue(n, "nom"),
      description: getXmlValue(n, "description"),
      salle: getXmlValue(n, "salle"),
      horaire: getXmlValue(n, "horaire"),
    })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await executeSOAP(`
        <tns:updateCourse>
          <id>${editId}</id>
          <cours>
            <nom>${formData.nom}</nom>
            <description>${formData.description}</description>
            <salle>${formData.salle}</salle>
            <horaire>${formData.horaire}</horaire>
          </cours>
        </tns:updateCourse>`);
      setEditId(null);
    } else {
      await executeSOAP(`
        <tns:addCourse>
          <cours>
            <nom>${formData.nom}</nom>
            <description>${formData.description}</description>
            <salle>${formData.salle}</salle>
            <horaire>${formData.horaire}</horaire>
          </cours>
        </tns:addCourse>`);
    }
    setFormData({ nom: '', description: '', salle: '', horaire: '' });
    fetchCourses();
  };

  const prepareEdit = (c: Course) => {
    setEditId(c.id);
    setFormData({ nom: c.nom, description: c.description, salle: c.salle, horaire: c.horaire });
  };

  const deleteCourse = async (id: string) => {
    if(!confirm("Supprimer ?")) return;
    await executeSOAP(`<tns:deleteCourse><id>${id}</id></tns:deleteCourse>`);
    fetchCourses();
  };

  useEffect(() => { fetchCourses(); }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {courses.map(c => (
          <div key={c.id} className={`bg-white border p-4 rounded flex justify-between items-center shadow-sm ${editId === c.id ? 'border-yellow-500 ring-1 ring-yellow-500' : ''}`}>
            <div>
              <div className="font-bold">{c.nom} <span className="text-xs text-gray-400 font-normal">#{c.id}</span></div>
              <div className="text-sm text-gray-600">{c.description}</div>
              <div className="text-xs mt-1 flex gap-2"><span className="bg-yellow-100 px-2 rounded text-yellow-800">{c.salle}</span> <span className="bg-green-100 px-2 rounded text-green-800">{c.horaire}</span></div>
            </div>
            <div className="flex gap-2">
              {role === 'ADMIN' && (
                <>
                  <button onClick={() => prepareEdit(c)} className="text-blue-400 hover:text-blue-600"><Edit size={18} /></button>
                  <button onClick={() => deleteCourse(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {role === 'ADMIN' && (
        <div className="bg-yellow-50 p-5 rounded border h-fit sticky top-0">
          <h3 className="font-bold mb-4 text-yellow-800 flex justify-between items-center">
            {editId ? 'Modifier Cours' : 'Ajouter Cours'}
            {editId && <button onClick={() => {setEditId(null); setFormData({ nom: '', description: '', salle: '', horaire: '' });}} className="text-xs underline">Annuler</button>}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border rounded p-2" placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
            <input className="w-full border rounded p-2" placeholder="Desc" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <input className="w-full border rounded p-2" placeholder="Salle" value={formData.salle} onChange={e => setFormData({...formData, salle: e.target.value})} />
            <input className="w-full border rounded p-2" placeholder="Horaire" value={formData.horaire} onChange={e => setFormData({...formData, horaire: e.target.value})} />
            <button className={`w-full text-white py-2 rounded transition-colors ${editId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}>
              {editId ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// --- MODULE 4 : FACTURATION (SOAP .NET + RELEVÉ + VÉRIF) ---
function BillingModule({ token, role }: { token: string; role: string | null }) {
  const [studentId, setStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [speciality, setSpeciality] = useState('Informatique');
  const [level, setLevel] = useState('3');
  const [invoiceId, setInvoiceId] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [showStatement, setShowStatement] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const soapCall = async (action: string, body: string, nodeName: string) => {
    try {
      const res = await fetch(`${API_GATEWAY}/ws/billing`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/xml', 
          Authorization: `Bearer ${token}`, 
          'SOAPAction': `http://tempuri.org/IBillingService/${action}` 
        },
        body: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/"><soapenv:Header/><soapenv:Body>${body}</soapenv:Body></soapenv:Envelope>`
      });
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/xml");
      return doc.getElementsByTagName(nodeName)[0]?.textContent || "Erreur";
    } catch { return "Erreur réseau"; }
  };

  const verifyAndProceed = async (action: () => Promise<void>) => {
    setErrorMsg('');
    const exists = await checkStudentExists(studentId, token);
    if (!exists) {
      setErrorMsg("❌ Opération impossible : Étudiant introuvable !");
      return;
    }
    await action();
  };

  const calculateFees = () => {
    soapCall('CalculerFrais', `<tem:CalculerFrais><tem:specialite>${speciality}</tem:specialite><tem:niveau>${level}</tem:niveau></tem:CalculerFrais>`, 'CalculerFraisResult').then(res => setAmount(res));
  };

  const createInvoice = () => verifyAndProceed(async () => {
    const res = await soapCall('CreerFacture', `<tem:CreerFacture><tem:etudiantId>${studentId}</tem:etudiantId><tem:montant>${amount}</tem:montant></tem:CreerFacture>`, 'CreerFactureResult');
    setInvoiceId(res);
    setStatusMsg(`Facture créée : ${res}`);
  });

  const payInvoice = () => verifyAndProceed(async () => {
    const res = await soapCall('PayerFacture', `<tem:PayerFacture><tem:factureId>${invoiceId}</tem:factureId></tem:PayerFacture>`, 'PayerFactureResult');
    setStatusMsg(`Paiement : ${res}`);
  });

  const generateStatement = () => verifyAndProceed(async () => {
    const res = await soapCall('GetStatutEtudiant', `<tem:GetStatutEtudiant><tem:etudiantId>${studentId}</tem:etudiantId></tem:GetStatutEtudiant>`, 'GetStatutEtudiantResult');
    setStatusMsg(res);
    setShowStatement(true);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2"><Calculator size={20} /> 1. Calculateur de Frais</h3>
        <div className="space-y-4">
          <select className="w-full p-2 rounded border" value={speciality} onChange={e => setSpeciality(e.target.value)}>
            <option value="Informatique">Informatique (+1000)</option>
            <option value="Gestion">Gestion</option>
          </select>
          <select className="w-full p-2 rounded border" value={level} onChange={e => setLevel(e.target.value)}>
            <option value="3">Licence (3)</option>
            <option value="5">Master (5) (+500)</option>
          </select>
          <button onClick={calculateFees} className="w-full bg-purple-600 text-white py-2 rounded">Estimer</button>
          {amount && <div className="text-center font-bold text-xl text-purple-700">{amount} TND</div>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="font-bold mb-4">2. Gestion & Relevé</h3>
          <input className="w-full p-2 border rounded mb-3 font-mono text-sm" placeholder="ID Étudiant" value={studentId} onChange={e => setStudentId(e.target.value)} />
          {errorMsg && <div className="bg-red-100 text-red-700 p-2 text-sm rounded mb-3">{errorMsg}</div>}
          
          <div className="grid grid-cols-2 gap-3">
            {role === 'ADMIN' && (
              <button onClick={createInvoice} disabled={!amount} className="bg-blue-600 text-white py-2 rounded disabled:opacity-50">Créer Facture</button>
            )}
            <button onClick={generateStatement} className="bg-gray-800 text-white py-2 rounded flex items-center justify-center gap-2"><FileText size={16}/> Relevé</button>
          </div>
        </div>

        {invoiceId && (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
            <div className="text-sm text-green-800 mb-2">Facture active : <span className="font-mono font-bold">{invoiceId}</span></div>
            <button onClick={payInvoice} className="w-full bg-green-600 text-white py-2 rounded flex justify-center items-center gap-2">
              <DollarSign size={18} /> Payer Maintenant
            </button>
          </div>
        )}

        {showStatement && (
          <div className="border-2 border-dashed border-gray-300 p-4 rounded bg-gray-50 text-sm">
            <div className="font-bold text-center mb-2 uppercase tracking-wide text-gray-500">Relevé de Paiement</div>
            <div className="flex justify-between mb-1"><span>Étudiant:</span> <span className="font-mono">{studentId}</span></div>
            <div className="flex justify-between mb-1"><span>Date:</span> <span>{new Date().toLocaleDateString()}</span></div>
            <div className="my-2 border-b"></div>
            <div className="flex justify-between items-center font-bold text-lg">
              <span>Statut:</span>
              <span className={statusMsg.includes('EN_REGLE') ? 'text-green-600' : 'text-red-600'}>
                {statusMsg || 'Inconnu'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANT NAVIGATION ---
function NavButton({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {React.cloneElement(icon, { size: 18 })} <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// --- LOGIN SCREEN ---
function LoginScreen({ onLogin }: any) {
  const [isLogin, setIsLogin] = useState(true);
  const [creds, setCreds] = useState({email: 'test@univ.tn', password: '123'});
  const [registerData, setRegisterData] = useState({email: '', password: '', role: 'STUDENT'});
  const [err, setErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const login = async (e: any) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${API_GATEWAY}/auth/login`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(creds)
      });
      const data = await res.json();
      if(res.ok) onLogin(data.token, data.role);
      else setErr(data.message || "Erreur login");
    } catch { setErr("Erreur Gateway"); }
  };

  const register = async (e: any) => {
    e.preventDefault();
    setErr('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_GATEWAY}/auth/register`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(registerData)
      });
      if(res.ok) {
        setSuccessMsg("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        setIsLogin(true);
        setRegisterData({email: '', password: '', role: 'STUDENT'});
      } else {
        const data = await res.json();
        setErr(data.message || "Erreur inscription");
      }
    } catch { setErr("Erreur Gateway"); }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white p-8 rounded-2xl w-96 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-2xl font-bold">{isLogin ? 'Connexion' : 'Inscription'}</h1>
        </div>
        <div className="flex mb-4">
          <button onClick={() => {setIsLogin(true); setErr(''); setSuccessMsg('');}} className={`flex-1 py-2 rounded-l-lg ${isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Connexion</button>
          <button onClick={() => {setIsLogin(false); setErr(''); setSuccessMsg('');}} className={`flex-1 py-2 rounded-r-lg ${!isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Inscription</button>
        </div>
        {err && <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">{err}</div>}
        {successMsg && <div className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm text-center">{successMsg}</div>}
        {isLogin ? (
          <form onSubmit={login} className="space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Email" value={creds.email} onChange={e=>setCreds({...creds, email: e.target.value})} />
            <input className="w-full border p-2 rounded" type="password" placeholder="Mot de passe" value={creds.password} onChange={e=>setCreds({...creds, password: e.target.value})} />
            <button className="w-full bg-blue-600 text-white py-2 rounded font-bold">Entrer</button>
          </form>
        ) : (
          <form onSubmit={register} className="space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Email" type="email" required value={registerData.email} onChange={e=>setRegisterData({...registerData, email: e.target.value})} />
            <input className="w-full border p-2 rounded" type="password" placeholder="Mot de passe" required value={registerData.password} onChange={e=>setRegisterData({...registerData, password: e.target.value})} />
            <select className="w-full border p-2 rounded" value={registerData.role} onChange={e=>setRegisterData({...registerData, role: e.target.value})}>
              <option value="STUDENT">Étudiant</option>
              <option value="ADMIN">Administrateur</option>
              <option value="PROFESSOR">Professeur</option>
            </select>
            <button className="w-full bg-green-600 text-white py-2 rounded font-bold">S'inscrire</button>
          </form>
        )}
      </div>
    </div>
  );
}
