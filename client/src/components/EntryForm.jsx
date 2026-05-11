import { useState, useRef } from 'react';
import { todayInputValue, formatDateInput } from '../utils/date';
import { resizeImage } from '../utils/imageResize';
import styles from './EntryForm.module.css';

const MOODS = [
  { value: 'happy',       label: 'Happy ' },
  { value: 'melancholic', label: 'Melancholic ' },
  { value: 'excited',     label: 'Excited ' },
  { value: 'grateful',    label: 'Grateful ' },
  { value: 'anxious',     label: 'Anxious ' },
  { value: 'peaceful',    label: 'Peaceful ' },
  { value: 'nostalgic',   label: 'Nostalgic ' },
];

export default function EntryForm({ initial = {}, onSubmit, loading }) {
  const [title,      setTitle]      = useState(initial.title      || '');
  const [date,       setDate]       = useState(initial.date ? formatDateInput(initial.date) : todayInputValue());
  const [mood,       setMood]       = useState(initial.mood       || 'peaceful');
  const [highlights, setHighlights] = useState((initial.highlights || []).join('\n'));
  const [reflection, setReflection] = useState(initial.reflection || '');
  const [imageData,  setImageData]  = useState(initial.image      || null);
  const [imageName,  setImageName]  = useState('');
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError,   setImgError]   = useState(null);
  const fileRef = useRef();

  const handleImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgError(null);
    setImgLoading(true);
    setImageName(file.name);
    try {
      const resized = await resizeImage(file, 1200, 900, 0.82);
      setImageData(resized);
    } catch {
      setImgError('Could not process image. Please try another file.');
      setImageName('');
    } finally {
      setImgLoading(false);
    }
  };

  const removeImage = () => {
    setImageData(null);
    setImageName('');
    setImgError(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: title.trim(),
      date,
      mood,
      highlights: highlights.split('\n').map((s) => s.trim()).filter(Boolean),
      reflection: reflection.trim(),
      image: imageData,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      {/* ── Photo upload — top ── */}
      <div className={styles.uploadSection}>
        {/* Circle button — hidden once image is selected */}
        {!imageData && !imgLoading && (
          <>
            <button
              type="button"
              className={styles.uploadCircle}
              onClick={() => fileRef.current?.click()}
            >
              <span className={styles.uploadArr}>↑</span>
              <span className={styles.uploadCircleLabel}>Photo</span>
            </button>
            <p className={styles.uploadHint}>optional — click to upload</p>
          </>
        )}

        {imgLoading && (
          <div className={styles.uploadCircle} style={{ opacity: 0.4, cursor: 'default' }}>
            <span className={styles.uploadCircleLabel}>…</span>
          </div>
        )}

        {/* Preview — replaces circle once loaded */}
        {imageData && !imgLoading && (
          <div className={styles.previewWrap}>
            <img src={imageData} alt="Preview" className={styles.preview} />
            <button type="button" className={styles.removeImg} onClick={removeImage}>
              Remove
            </button>
            <p className={styles.imgName}>{imageName}</p>
          </div>
        )}

        {imgError && <p className={styles.imgError}>{imgError}</p>}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImage}
        />
      </div>

      {/* ── Date + Mood ── */}
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            type="date"
            className={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className={`${styles.field} ${styles.fieldRight}`}>
          <label className={styles.label}>Mood</label>
          <select
            className={styles.input}
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            {MOODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Title ── */}
      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Give this day a name…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={200}
        />
      </div>

      {/* ── Highlights ── */}
      <div className={styles.field}>
        <label className={styles.label}>Today's Highlights — one per line</label>
        <textarea
          className={styles.input}
          placeholder={'Morning coffee on the balcony\nFinished that book\nUnexpected call from an old friend'}
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          rows={4}
        />
      </div>

      {/* ── Reflection ── */}
      <div className={styles.field}>
        <label className={styles.label}>Reflection</label>
        <textarea
          className={`${styles.input} ${styles.tall}`}
          placeholder="Write freely. What's on your mind?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={6}
          maxLength={5000}
        />
        <p className={styles.charCount}>{reflection.length} / 5000</p>
      </div>

      <button
        type="submit"
        className={styles.submit}
        disabled={loading || imgLoading}
      >
        {imgLoading ? 'Processing image…' : loading ? 'Saving…' : 'Save Entry ✦'}
      </button>
    </form>
  );
}
