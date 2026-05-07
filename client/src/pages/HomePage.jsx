import { useEntries } from '../hooks/useEntries';
import EntryCard from '../components/EntryCard';
import Footer from '../components/Footer';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { entries, stats, loading, error } = useEntries();

  const recent = entries.slice(0, 6);

  return (
    <>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        {/* Left: typography */}
        <div className={styles.heroLeft}>
          <div>
            <p className={styles.eyebrow}>Personal Chronicle — Est. 2025</p>
            <h1 className={styles.title}>
              My<br />Diary
              <em className={styles.titleSub}>a daily record</em>
            </h1>
            <p className={styles.desc}>
              365 days of small moments, big feelings, and everything in between.
              Questionable decisions, unexpected thoughts, and a whole lot of life.
            </p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statN}>{stats?.daysSince ?? '—'}</span>
              <span className={styles.statL}>Days Logged</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statN}>{stats?.total ?? '—'}</span>
              <span className={styles.statL}>Entries</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statN}>7</span>
              <span className={styles.statL}>Moods</span>
            </div>
          </div>
        </div>

        {/* Right: recent entry list */}
        <div className={styles.heroRight}>
          <div className={styles.dateStack}>
            {recent.length === 0 && !loading && (
              <div className={styles.stackRow}>
                <span className={styles.stackLabel}>—</span>
                <span className={styles.stackVal}>No entries yet</span>
              </div>
            )}
            {recent.map((e, i) => (
              <div key={e._id} className={styles.stackRow}>
                <span className={styles.stackLabel}>
                  {i === 0
                    ? 'Latest'
                    : new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className={styles.stackVal}>{e.title}</span>
                <span className={styles.stackNum}>{String(i + 1).padStart(2, '0')}</span>
              </div>
            ))}
          </div>
          <div className={styles.bigDay}>{stats?.daysSince ?? ''}</div>
        </div>
      </section>

      {/* ── Section header ── */}
      <div className={styles.sectionHeader}>
        <h2>Lettuce Begin!</h2>
        <span>{stats?.total ?? 0} entries</span>
      </div>

      {/* ── Grid ── */}
      {loading && <p className={styles.status}>Loading entries…</p>}
      {error   && <p className={styles.error}>Error: {error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {entries.length === 0 ? (
            <p className={styles.status} style={{ gridColumn: '1/-1' }}>
              No entries yet. Write your first one!
            </p>
          ) : (
            entries.map((entry, i) => (
              <EntryCard key={entry._id} entry={entry} index={i} />
            ))
          )}
        </div>
      )}

      <Footer />
    </>
  );
}
