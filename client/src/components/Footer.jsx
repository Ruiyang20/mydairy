import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.decoL}>✿</div>
      <div className={styles.decoR}>✿</div>
      <div className={styles.icon}>📚</div>
      <nav className={styles.links}>
        <a href="#vocabulary">我的单词本</a>
        <a href="/write">记事本</a>
        <a href="#features">五大功能</a>
      </nav>
      <p className={styles.copy}>my dairy · one notebook for words, notes, and ai-guided practice</p>
    </footer>
  );
}
