import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.decoL}>✿</div>
      <div className={styles.decoR}>✿</div>
      <div className={styles.icon}>📔</div>
      <nav className={styles.links}>
        <a href="#">About Me</a>
        <a href="#">Instagram</a>
        <a href="#">Twitter</a>
      </nav>
      <p className={styles.copy}>my diary · started with a blank page · all feelings reserved</p>
    </footer>
  );
}
