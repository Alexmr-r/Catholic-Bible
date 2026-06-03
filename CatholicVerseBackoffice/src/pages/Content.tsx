import { useState, useEffect } from 'react';
import { Calendar, Plus, BookOpen, Trash2, Check, AlertCircle, Edit3 } from 'lucide-react';

interface DailyReading {
  id: string;
  date: string;
  badge: string;
  title: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumbers: number[];
  readingText: string;
  officialReflection: string;
  imageUrl?: string;
}

interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  totalChapters: number;
  testament: string;
}

interface BibleVerse {
  verseNumber: number;
  text: string;
  hasNote: boolean;
}

interface BibleSection {
  title: string;
  verses: BibleVerse[];
}

interface ChapterResponse {
  bookId: string;
  chapterNumber: number;
  sections: BibleSection[];
}

export default function Content() {
  const [activeTab, setActiveTab] = useState<'readings' | 'bible'>('readings');
  const [readings, setReadings] = useState<DailyReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab 1: Liturgical Readings state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [date, setDate] = useState('');
  const [badge, setBadge] = useState('Ordinary Time');
  const [title, setTitle] = useState('');
  const [bookId, setBookId] = useState('');
  const [bookName, setBookName] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [verseNumbersStr, setVerseNumbersStr] = useState('');
  const [readingText, setReadingText] = useState('');
  const [officialReflection, setOfficialReflection] = useState('');

  // Tab 2: Bible Editor state
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [chapterContent, setChapterContent] = useState<ChapterResponse | null>(null);
  const [loadingBible, setLoadingBible] = useState(false);
  const [editingVerse, setEditingVerse] = useState<BibleVerse | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [bibleError, setBibleError] = useState<string | null>(null);

  const backendUrl = localStorage.getItem('springBootUrl') || 'https://api.getcatholicverse.com/api/v1';

  // Sort helper
  const sortReadingsByDate = (list: DailyReading[]) => {
    return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Fetch liturgical readings
  const fetchReadings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/admin/daily-readings`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setReadings(sortReadingsByDate(data));
      setError(null);
    } catch (err) {
      console.warn('Backend connection offline, loading sandbox fallback calendar.', err);
      setError('Running in standalone Sandbox Mode. Changes are saved locally.');
      // Premium Mock Fallback
      setReadings(sortReadingsByDate([
        {
          id: '1',
          date: '2026-05-22',
          badge: 'Ordinary Time',
          title: 'Friday of the Seventh Week in Ordinary Time',
          bookId: 'james',
          bookName: 'James',
          chapterNumber: 5,
          verseNumbers: [9, 10, 11, 12],
          readingText: 'Do not complain, brothers, against one another, so that you may not be judged. Behold, the Judge is standing before the gates.',
          officialReflection: 'Today we reflect on the patience needed to live Christian fraternity without grumbling.'
        },
        {
          id: '2',
          date: '2026-05-24',
          badge: 'Easter',
          title: 'Pentecost Sunday',
          bookId: 'acts',
          bookName: 'Acts',
          chapterNumber: 2,
          verseNumbers: [1, 2, 3, 4],
          readingText: 'When the time for Pentecost was fulfilled, they were all in one place together. And suddenly there came from the sky a noise like a strong driving wind.',
          officialReflection: 'The Holy Spirit descends to break our fears and empower us to preach the Good News.'
        }
      ]));
    } finally {
      setLoading(false);
    }
  };

  // Fetch Bible books
  const fetchBooks = async () => {
    try {
      setBibleError(null);
      const res = await fetch(`${backendUrl}/bible/books`);
      if (!res.ok) throw new Error('Failed to load books');
      const data = await res.json();
      setBooks(data);
      if (data.length > 0) {
        setSelectedBookId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setBibleError('Failed to fetch books from the production Spring Boot service.');
      // Mock books fallback so UI renders beautifully
      setBooks([
        { id: 'genesis', name: 'Genesis', abbreviation: 'Gn', totalChapters: 50, testament: 'OLD' },
        { id: 'matthew', name: 'Matthew', abbreviation: 'Mt', totalChapters: 28, testament: 'NEW' },
        { id: 'john', name: 'John', abbreviation: 'Jn', totalChapters: 21, testament: 'NEW' }
      ]);
      setSelectedBookId('genesis');
    }
  };

  // Fetch Bible chapter verses
  const fetchChapterContent = async (bookIdToFetch: string, chapterToFetch: number) => {
    if (!bookIdToFetch) return;
    try {
      setLoadingBible(true);
      setBibleError(null);
      const res = await fetch(`${backendUrl}/bible/books/${bookIdToFetch}/chapters/${chapterToFetch}`);
      if (!res.ok) throw new Error('Failed to load chapter');
      const data = await res.json();
      setChapterContent(data);
    } catch (err) {
      console.error(err);
      setBibleError('Failed to fetch chapter from the database. Mocking layout for visual preview.');
      // Visual placeholder
      setChapterContent({
        bookId: bookIdToFetch,
        chapterNumber: chapterToFetch,
        sections: [
          {
            title: 'Visual Sandbox Preview',
            verses: [
              { verseNumber: 1, text: 'In the beginning God created the heavens and the earth.', hasNote: false },
              { verseNumber: 2, text: 'The earth was without form and void, and darkness was over the face of the deep.', hasNote: false },
              { verseNumber: 3, text: 'And God said, "Let there be light," and there was light.', hasNote: false }
            ]
          }
        ]
      });
    } finally {
      setLoadingBible(false);
    }
  };

  useEffect(() => {
    fetchReadings();
    fetchBooks();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      fetchChapterContent(selectedBookId, selectedChapter);
    }
  }, [selectedBookId, selectedChapter]);

  // Handle Add/Schedule Liturgical Reading
  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title || !readingText) return;

    const parsedVerses = verseNumbersStr
      ? verseNumbersStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))
      : [];

    const readingPayload = {
      date,
      title,
      badge,
      imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579',
      bookId: bookId || 'unknown',
      bookName: bookName || 'Selected Passage',
      chapterNumber: chapterNumber,
      verseNumbers: parsedVerses,
      readingText,
      officialReflection
    };

    try {
      const res = await fetch(`${backendUrl}/admin/daily-readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingPayload)
      });
      if (!res.ok) throw new Error('Save reading failed');
      const savedReading = await res.json();
      setReadings(sortReadingsByDate([...readings.filter(r => r.date !== date), savedReading]));
    } catch (err) {
      console.warn('API error, saving locally in sandbox', err);
      // Local fallback
      const mockSaved: DailyReading = {
        id: Date.now().toString(),
        ...readingPayload
      };
      setReadings(sortReadingsByDate([...readings.filter(r => r.date !== date), mockSaved]));
    }

    // Reset Form
    setDate('');
    setBadge('Ordinary Time');
    setTitle('');
    setBookId('');
    setBookName('');
    setChapterNumber(1);
    setVerseNumbersStr('');
    setReadingText('');
    setOfficialReflection('');
    setIsFormOpen(false);
  };

  // Handle Delete Liturgical Reading
  const handleDeleteReading = async (readingDate: string) => {
    try {
      const res = await fetch(`${backendUrl}/admin/daily-readings/${readingDate}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      setReadings(readings.filter(r => r.date !== readingDate));
    } catch (err) {
      console.warn('API error, deleting locally', err);
      setReadings(readings.filter(r => r.date !== readingDate));
    }
  };

  // Handle Save Verse Errata Correction
  const handleSaveVerseCorrection = async () => {
    if (!editingVerse || !selectedBookId) return;
    
    const updatePayload = {
      bookId: selectedBookId,
      chapterNumber: selectedChapter,
      verseNumber: editingVerse.verseNumber,
      text: editingText
    };

    try {
      const res = await fetch(`${backendUrl}/admin/bible/verses`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
      if (!res.ok) throw new Error('Verse update failed');
      
      // Update UI state in real time
      if (chapterContent) {
        const updatedSections = chapterContent.sections.map(section => ({
          ...section,
          verses: section.verses.map(v => 
            v.verseNumber === editingVerse.verseNumber ? { ...v, text: editingText } : v
          )
        }));
        setChapterContent({ ...chapterContent, sections: updatedSections });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save correction to the database. Running in offline sandbox: UI updated.');
      
      if (chapterContent) {
        const updatedSections = chapterContent.sections.map(section => ({
          ...section,
          verses: section.verses.map(v => 
            v.verseNumber === editingVerse.verseNumber ? { ...v, text: editingText } : v
          )
        }));
        setChapterContent({ ...chapterContent, sections: updatedSections });
      }
    }
    setEditingVerse(null);
  };

  const selectedBook = books.find(b => b.id === selectedBookId);

  return (
    <div>
      {/* Header with Navigation Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Ecosystem Content CMS</h1>
          <p style={{ color: 'var(--text-muted)' }}>Publish daily liturgical passages, assign audio streams, and correct database verse erratas in real time.</p>
        </div>
        
        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '4px'
        }}>
          <button 
            onClick={() => setActiveTab('readings')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'readings' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'readings' ? 'var(--gold)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <Calendar size={16} /> Liturgical Calendar
          </button>
          <button 
            onClick={() => setActiveTab('bible')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'bible' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'bible' ? 'var(--gold)' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={16} /> Bible Editor (CMS)
          </button>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: 'rgba(212, 175, 55, 0.1)', 
          border: '1px solid rgba(212, 175, 55, 0.3)', 
          borderRadius: '12px', 
          padding: '12px 16px', 
          color: 'var(--gold)', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: LITURGICAL CALENDAR CMS */}
      {/* ======================================================== */}
      {activeTab === 'readings' && (
        <div>
          {/* Liturgical Seasons Indicator */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { name: 'Advent', color: '#9067C6', label: 'PURPLE' },
              { name: 'Christmas', color: '#D4AF37', label: 'GOLD' },
              { name: 'Lent', color: '#6A0DAD', label: 'VIOLET' },
              { name: 'Easter', color: '#F4F1EA', label: 'WHITE' },
              { name: 'Ordinary Time', color: '#6B9080', label: 'GREEN' }
            ].map((s) => (
              <div key={s.name} className="card" style={{ padding: '16px', borderLeft: `4px solid ${s.color}` }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>{s.label} SEASON</span>
                <strong style={{ fontSize: '18px', display: 'block', marginTop: '6px', color: 'var(--text)' }}>{s.name}</strong>
              </div>
            ))}
          </div>

          {/* CMS Listings */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '22px' }}>Scheduled Liturgical Passages</h3>
              <button className="btn" onClick={() => setIsFormOpen(true)}>
                <Plus size={18} /> Schedule New Reading
              </button>
            </div>
            
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Liturgy Date</th>
                    <th>Liturgical Title</th>
                    <th>Reference Book</th>
                    <th>Passage Text preview</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                          <span className="spinner" style={{
                            width: '20px',
                            height: '20px',
                            border: '2px solid rgba(212, 175, 55, 0.2)',
                            borderTopColor: 'var(--gold)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }}></span>
                          Retrieving liturgical schedule from PostgreSQL...
                        </div>
                      </td>
                    </tr>
                  ) : readings.length > 0 ? (
                    readings.map((reading) => (
                      <tr key={reading.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={16} color="var(--gold)" />
                            <strong style={{ fontSize: '14px' }}>{reading.date}</strong>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 600 }}>{reading.title}</div>
                            <span className="badge free" style={{ fontSize: '10px', marginTop: '4px', display: 'inline-block' }}>{reading.badge}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <strong>{reading.bookName} {reading.chapterNumber}</strong>
                          <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>Verses: {reading.verseNumbers.join(', ')}</div>
                        </td>
                        <td>
                          <div style={{ 
                            fontSize: '13px', 
                            color: 'var(--text-muted)', 
                            maxWidth: '300px', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis'
                          }}>
                            {reading.readingText}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDeleteReading(reading.date)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--burgundy-light)', cursor: 'pointer', padding: '6px' }}
                            title="Delete Reading"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No liturgical readings scheduled.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BIBLE EDITOR (CMS) */}
      {/* ======================================================== */}
      {activeTab === 'bible' && (
        <div>
          {/* Editor selection controls */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label">Select Book</label>
              <select 
                className="form-select" 
                value={selectedBookId} 
                onChange={(e) => {
                  setSelectedBookId(e.target.value);
                  setSelectedChapter(1);
                }}
              >
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.abbreviation})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Chapter</label>
              <select 
                className="form-select" 
                value={selectedChapter} 
                onChange={(e) => setSelectedChapter(parseInt(e.target.value))}
              >
                {Array.from({ length: selectedBook?.totalChapters || 28 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Chapter {num}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Testament: <strong>{selectedBook?.testament}</strong></span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Total Chapters: <strong>{selectedBook?.totalChapters}</strong></span>
            </div>
          </div>

          {/* Verses Correction Interface */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} color="var(--gold)" />
                <span>Text Corrector: {selectedBook?.name} {selectedChapter}</span>
              </h3>
              <span style={{ fontSize: '12px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', padding: '6px 12px', borderRadius: '20px' }}>
                Click on any verse to fix translation or typos instantly.
              </span>
            </div>

            {bibleError && (
              <div style={{ color: 'var(--gold)', fontSize: '13px', background: 'rgba(212, 175, 55, 0.05)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                ⚠️ {bibleError}
              </div>
            )}

            {loadingBible ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                <span className="spinner" style={{
                  display: 'inline-block',
                  width: '24px',
                  height: '24px',
                  border: '2px solid rgba(212, 175, 55, 0.2)',
                  borderTopColor: 'var(--gold)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '10px'
                }}></span>
                <div>Loading chapter text from PostgreSQL...</div>
              </div>
            ) : chapterContent && chapterContent.sections && chapterContent.sections.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {chapterContent.sections.map((section, sIdx) => (
                  <div key={sIdx} style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '18px', color: 'var(--gold)', marginBottom: '16px', borderBottom: '1px dashed var(--border)', paddingBottom: '8px' }}>
                      {section.title || 'Untitled Section'}
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {section.verses.map((verse) => (
                        <div 
                          key={verse.verseNumber}
                          onClick={() => {
                            setEditingVerse(verse);
                            setEditingText(verse.text);
                          }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '40px 1fr 30px',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            border: '1px solid transparent'
                          }}
                          className="verse-row-hover"
                        >
                          <strong style={{ color: 'var(--gold)', fontSize: '15px' }}>{verse.verseNumber}</strong>
                          <span style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.6' }}>{verse.text}</span>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                            <Edit3 size={14} className="edit-icon-hover" />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No verses loaded for this chapter.</div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: SCHEDULE DAILY READING */}
      {/* ======================================================== */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '26px', marginBottom: '8px' }}>Schedule Daily Reading</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Define the liturgical calendar readings and configure the audio file.</p>
            
            <form onSubmit={handleAddReading}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Liturgy Date</label>
                  <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Liturgical Season</label>
                  <select className="form-select" value={badge} onChange={e => setBadge(e.target.value)}>
                    <option value="Ordinary Time">Ordinary Time</option>
                    <option value="Advent">Advent</option>
                    <option value="Christmas">Christmas</option>
                    <option value="Lent">Lent</option>
                    <option value="Easter">Easter</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Liturgical Day Title</label>
                <input type="text" className="form-input" placeholder="e.g. Pentecost Sunday" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Book Id</label>
                  <input type="text" className="form-input" placeholder="e.g. acts" value={bookId} onChange={e => setBookId(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Book Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Acts" value={bookName} onChange={e => setBookName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Chapter</label>
                  <input type="number" className="form-input" value={chapterNumber} onChange={e => setChapterNumber(parseInt(e.target.value))} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Verse Numbers (comma-separated)</label>
                <input type="text" className="form-input" placeholder="e.g. 1, 2, 3, 4" value={verseNumbersStr} onChange={e => setVerseNumbersStr(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Reading Content Passage</label>
                <textarea className="form-textarea" rows={4} placeholder="Type or paste the complete verse contents..." value={readingText} onChange={e => setReadingText(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Liturgical Homily / Reflection (Optional)</label>
                <textarea className="form-textarea" rows={3} placeholder="Type pastoral reflections..." value={officialReflection} onChange={e => setOfficialReflection(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn">
                  <Check size={16} /> Publish to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT VERSE ERRATA CORRECTION */}
      {/* ======================================================== */}
      {editingVerse && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '8px', color: 'var(--gold)' }}>
              Correct Verse Errata
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              Modifying {selectedBook?.name} {selectedChapter}:{editingVerse.verseNumber} directly in the database.
            </p>

            <div className="form-group">
              <label className="form-label">Verse Text Content</label>
              <textarea 
                className="form-textarea" 
                rows={5} 
                value={editingText} 
                onChange={(e) => setEditingText(e.target.value)} 
                required 
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                This modification updates the verses table in real time. It will immediately reflect inside all CatholicVerse mobile devices upon sync.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setEditingVerse(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={handleSaveVerseCorrection}
              >
                <Check size={16} /> Save Database Correction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
