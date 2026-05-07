import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [pw, setPw]  = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [blink, setBlink]     = useState(true);

  // cursor blink via CSS animation in CSS file

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      await login(pw);
      navigate('/', { replace: true });
    } catch (error) {
      setErr(error.response?.data?.message || 'Wrong password');
      setPw('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Private Diary</p>
        <h1 className={styles.title}>
          My Diary<span className={styles.cursor} />
        </h1>
        <p className={styles.sub}>Enter your password to continue</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="············"
              autoFocus
              required
            />
          </div>

          {err && <p className={styles.error}>{err}</p>}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading ? 'Checking…' : 'Enter ✦'}
          </button>
        </form>
      </div>
    </div>
  );
}
