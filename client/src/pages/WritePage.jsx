import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEntry, createEntry, updateEntry } from '../utils/api';
import EntryForm from '../components/EntryForm';
import styles from './WritePage.module.css';

export default function WritePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [blink,   setBlink]   = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    fetchEntry(id)
      .then(setInitial)
      .catch((err) => setError(err.message));
  }, [id, isEdit]);

  // cursor blink
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      if (isEdit) {
        await updateEntry(id, data);
        navigate(`/entry/${id}`);
      } else {
        const created = await createEntry(data);
        navigate(`/entry/${created._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  if (isEdit && !initial) {
    return <p className={styles.status}>{error || 'Loading…'}</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.label}>{isEdit ? 'Edit Entry' : 'New Entry'}</p>
        <h1 className={styles.title}>
          {isEdit ? 'Update Your Day' : 'Write Your Day'}
          <span className={styles.cursor} style={{ opacity: blink ? 1 : 0 }} />
        </h1>
        <p className={styles.sub}>— feed the paper, start typing —</p>
      </div>

      <div className={styles.body}>
        {error && <p className={styles.error}>{error}</p>}
        <EntryForm
          initial={initial || {}}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
