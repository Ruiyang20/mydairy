import { Link } from 'react-router-dom';
import styles from './Nav.module.css';

export default function Nav({ onLogout }) {
  return (
    <nav className={styles.nav}>
      <div className={styles.left}>
        <Link to="/">探索</Link>
        <span className={styles.divider}>·</span>
        <div className={styles.learningMenu}>
          <button className={styles.menuTrigger} type="button">学习</button>
          <div className={styles.menuPanel} aria-label="学习菜单">
            <a href="#vocabulary">我的单词本</a>
            <a href="/write">记事本</a>
          </div>
        </div>
      </div>
      <div className={styles.center}>My Dairy</div>
      <div className={styles.right}>
        <a href="#features">功能入口</a>
        <span className={styles.divider}>·</span>
        <button className={styles.logoutBtn} onClick={onLogout}>Log out</button>
      </div>
    </nav>
  );
}
