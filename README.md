# 📔 My Diary — Full Stack App

**Stack:** MongoDB · Express · React · Node.js (MERN)  
**Auth:** Single-user password login · JWT (30 days)

---


## API Reference

All `/api/entries/*` routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ✗ | Get JWT token |
| POST | `/api/auth/verify` | ✗ | Check token validity |
| GET | `/api/entries` | ✓ | List entries |
| GET | `/api/entries/stats` | ✓ | Stats |
| GET | `/api/entries/:id` | ✓ | Single entry |
| POST | `/api/entries` | ✓ | Create |
| PUT | `/api/entries/:id` | ✓ | Update |
| DELETE | `/api/entries/:id` | ✓ | Delete |
