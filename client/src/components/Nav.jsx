import { Link } from 'react-router-dom';
import styles from './Nav.module.css';

export default function Nav({ onLogout }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link to="/">Home :)</Link>
      </div>
      <div className={styles.center}>My Diary</div>
      <div className={styles.right}>
        <a href="#footer">About</a>
        <span className={styles.divider}>·</span>
        <button className={styles.logoutBtn} onClick={onLogout}>Log out</button>
      </div>
    </nav>
  );
}
