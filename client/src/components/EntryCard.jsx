import { useNavigate } from 'react-router-dom';
import { formatDate, pad } from '../utils/date';
import styles from './EntryCard.module.css';

export default function EntryCard({ entry, index }) {
  const navigate = useNavigate();

  return (
    <div className={styles.card} onClick={() => navigate(`/entry/${entry._id}`)}>
      {entry.image
        ? (
          <div className={styles.imgBox}>
            <img className={styles.img} src={entry.image} alt={entry.title} />
          </div>
        )
        : <div className={styles.imgPlaceholder}>No Image</div>
      }

      <div className={styles.info}>
        <div className={styles.top}>
          <span className={styles.label}>Entry</span>
          <span className={styles.num}>#{pad(index + 1)}</span>
        </div>
        <div className={styles.title}>{entry.title}</div>
        <div className={styles.meta}>
          <span>{formatDate(entry.date)}</span>
          <span className={styles.arrow}>↗</span>
        </div>
      </div>
    </div>
  );
}
