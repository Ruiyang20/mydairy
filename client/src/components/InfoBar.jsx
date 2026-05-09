import styles from './InfoBar.module.css';

export default function InfoBar() {
  const today = new Date().toLocaleDateString('zh-CN', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  return (
    <div className={styles.bar}>
      <span className={styles.left}>{today}</span>
      <span className={styles.center}>AI 学习建议 · 单词本 · 记事本</span>
      <span className={styles.right}>Read. Listen. Speak. Write. Review.</span>
    </div>
  );
}
