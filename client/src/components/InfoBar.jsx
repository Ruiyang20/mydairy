import { useEffect, useState } from 'react';
import { fetchStats } from '../utils/api';
import styles from './InfoBar.module.css';

export default function InfoBar() {
  const [daysSince, setDaysSince] = useState('—');
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  useEffect(() => {
    fetchStats()
      .then((s) => setDaysSince(s.daysSince || 1))
      .catch(() => {});
  }, []);

  return (
    <div className={styles.bar}>
      <span className={styles.left}>{today}</span>
      <span className={styles.center}>My Diary · Day {daysSince}</span>
      <span className={styles.right}>Write. Remember. Reflect.</span>
    </div>
  );
}
