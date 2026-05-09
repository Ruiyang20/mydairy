import Footer from '../components/Footer';
import styles from './HomePage.module.css';

const featureCards = [
  {
    key: 'vocabulary',
    number: '01',
    title: '背单词',
    tag: 'Vocabulary',
    description: '导入外部单词书，或在 My Lexicon 里建立自己的长期单词本。',
    points: ['外部单词书导入', '内部自定义单词书', '复习计划与熟词标记'],
    href: '#vocabulary',
  },
  {
    key: 'speaking',
    number: '02',
    title: '口语',
    tag: 'Speaking',
    description: '用 role-based AI 语音交流，把练习变成真实场景里的对话。',
    points: ['AI 批改发音与表达', '自定义角色 / 场景 / 难度', '对话后生成改进建议'],
    href: '#speaking',
  },
  {
    key: 'writing',
    number: '03',
    title: '写作',
    tag: 'Writing',
    description: '围绕主题写作，保存草稿、持续修改，并交给 AI 自动润色。',
    points: ['Theme-based 写作', '自定义主题，可保存可修改', '单词 / 句子加入自定义单词书'],
    href: '#writing',
  },
  {
    key: 'listening',
    number: '04',
    title: '听力',
    tag: 'Listening',
    description: '把播客、YouTube、Spotify 等内容整理成可学习的听力材料。',
    points: ['自动生成字幕', 'AI 总结重点', '单词 / 句子加入自定义单词书'],
    href: '#listening',
  },
  {
    key: 'reading',
    number: '05',
    title: '阅读',
    tag: 'Reading',
    description: 'Theme-based 文章阅读，点击单词实时翻译，并沉淀表达素材。',
    points: ['按主题推荐文章', '点击单词实时翻译', '单词 / 句子加入自定义单词书'],
    href: '#reading',
  },
];

const advice = [
  '先用「阅读」选择一个主题，点击生词保存到自定义单词书。',
  '再用「听力」找同主题播客，自动字幕和总结帮助二次输入。',
  '最后进入「口语」或「写作」输出，AI 会批改并把好句加入你的素材库。',
];

export default function HomePage() {
  return (
    <>
      <section className={styles.hero} id="explore">
        <div className={styles.heroLeft}>
          <div>
            <p className={styles.eyebrow}>AI Language Studio — Explore</p>
            <h1 className={styles.title}>
              My<br />Dairy
              <em className={styles.titleSub}>learn in five ways</em>
            </h1>
            <p className={styles.desc}>
              保留手账式纸感与复古排版，把背单词、口语、写作、听力、阅读串成一个可积累的英语学习工作台。
            </p>
          </div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statN}>05</span>
              <span className={styles.statL}>Core Skills</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statN}>AI</span>
              <span className={styles.statL}>Coach</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statN}>∞</span>
              <span className={styles.statL}>Custom Books</span>
            </div>
          </div>
        </div>

        <div className={styles.heroRight} aria-label="功能入口">
          <div className={styles.dateStack}>
            {featureCards.map((feature) => (
              <a key={feature.key} href={feature.href} className={styles.stackRow}>
                <span className={styles.stackLabel}>{feature.tag}</span>
                <span className={styles.stackVal}>{feature.title}</span>
                <span className={styles.stackNum}>{feature.number}</span>
              </a>
            ))}
          </div>
          <div className={styles.bigDay}>AI</div>
        </div>
      </section>

      <section className={styles.advicePanel} aria-labelledby="ai-advice-title">
        <div className={styles.adviceIntro}>
          <p className={styles.eyebrow}>AI Study Advice</p>
          <h2 id="ai-advice-title">今日学习建议</h2>
          <p>探索页只保留 AI 学习建议与五大功能入口，帮助你从输入、积累到输出形成闭环。</p>
        </div>
        <ol className={styles.adviceList}>
          {advice.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item}
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.sectionHeader} id="features">
        <h2>Five Learning Doors</h2>
        <span>明确五大功能入口</span>
      </div>

      <section className={styles.featureGrid}>
        {featureCards.map((feature) => (
          <article key={feature.key} id={feature.key} className={styles.featureCard}>
            <div className={styles.cardTopline}>
              <span>{feature.number}</span>
              <em>{feature.tag}</em>
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
            <ul>
              {feature.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <a href={feature.href} className={styles.cardAction}>进入 {feature.title}</a>
          </article>
        ))}
      </section>

      <Footer />
    </>
  );
}
