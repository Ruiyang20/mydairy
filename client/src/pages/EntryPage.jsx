import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchEntries, fetchEntry, deleteEntry } from '../utils/api';
import { formatDate, pad } from '../utils/date';
import Footer from '../components/Footer';
import styles from './EntryPage.module.css';

export default function EntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry,   setEntry]   = useState(null);
  const [allIds,  setAllIds]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [single, list] = await Promise.all([
          fetchEntry(id),
          fetchEntries({ limit: 200 }),
        ]);
        if (!cancelled) {
          setEntry(single);
          setAllIds(list.entries.map((e) => e._id));
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry?')) return;
    await deleteEntry(id);
    navigate('/');
  };

  if (loading) return <p className={styles.status}>Loading…</p>;
  if (error)   return <p className={styles.error}>Error: {error}</p>;
  if (!entry)  return null;

  const idx      = allIds.indexOf(id);
  const entryNum = idx >= 0 ? idx + 1 : '?';
  const prevId   = allIds[idx + 1] ?? null;
  const nextId   = allIds[idx - 1] ?? null;
  const highlights = Array.isArray(entry.highlights) ? entry.highlights : [];
  const hasImage = Boolean(entry.image);

  return (
    <>
      {/* ── Two-column: image left | meta right ── */}
      <div className={`${styles.detailLayout} ${!hasImage ? styles.noImage : ''}`}>

        {hasImage && (
          <div className={styles.detailImgCol}>
            <img className={styles.detailImg} src={entry.image} alt={entry.title} />
          </div>
        )}

        <div className={styles.detailMeta}>
          <p className={styles.entryLabel}>Entry #{pad(entryNum)}</p>
          <h1 className={styles.title}>{entry.title.toUpperCase()}</h1>
          <p className={styles.date}>{formatDate(entry.date)}</p>

          <hr className={styles.divider} />

          {highlights.length > 0 && (
            <>
              <h2 className={styles.sectionTitle}>Today's Highlights</h2>
              <ul className={styles.highlights}>
                {highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </>
          )}

          {entry.reflection && (
            <>
              <h2 className={styles.sectionTitle}>Reflections</h2>
              <p className={styles.reflection}>{entry.reflection}</p>
            </>
          )}

          <div className={styles.actions}>
            <Link to={`/edit/${entry._id}`} className={styles.editBtn}>Edit</Link>
            <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>

      {/* ── Prev / Next ── */}
      <div className={styles.entryNav}>
        {prevId ? (
          <Link to={`/entry/${prevId}`} className={styles.navItem}>
            <div className={styles.navTop}>
              <span className={styles.navArrow}>←</span>
              <span>Previous</span>
            </div>
          </Link>
        ) : (
          <div className={`${styles.navItem} ${styles.navDisabled}`}>
            <div className={styles.navTop}><span></span><span>No more entries</span></div>
          </div>
        )}
        {nextId ? (
          <Link to={`/entry/${nextId}`} className={`${styles.navItem} ${styles.navRight}`}>
            <div className={styles.navTop}>
              <span>Next</span>
              <span className={styles.navArrow}>→</span>
            </div>
          </Link>
        ) : (
          <div className={`${styles.navItem} ${styles.navRight} ${styles.navDisabled}`}>
            <div className={styles.navTop}><span>Latest entry</span><span></span></div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
