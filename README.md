## TurboCafe

A full‑stack food vendor application with a Django REST Framework backend and a React (Vite) frontend.

<br/>


Project features:
- User authentication with JWT (login, logout, token refresh)
- Menu management with categories and images
- Order placement and tracking
- API documentation with Swagger UI and Redoc
- Responsive frontend UI with Tailwind CSS
- Development setup with Vite and Django
- Comprehensive backend tests
- Media handling for uploaded images

- **Backend**: Django 5, DRF, SimpleJWT, drf-spectacular
- **Frontend**: React 19, Vite 6, Tailwind CSS
- **API Docs**: Swagger UI and Redoc exposed via DRF Spectacular

---

### Project structure

```
turbocafe/
  backend/                 # Django project and apps
    auth/                  # Authentication app (JWT)
    menu/                  # Menu management
    orders/                # Order management
    turbocafe/             # Django project settings and urls
    manage.py
    requirements.txt
  frontend/                # React (Vite) application
    src/
    index.html
    package.json
    vite.config.js
  README.md
```

---

### Prerequisites

- Python 3.10+ recommended
- Node.js 18+ and npm 9+

---

### Backend: setup and run

1) Create and activate a virtual environment (optional if you use the bundled `backend/venv/`).

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

2) Install Python dependencies.

```bash
pip install -r requirements.txt
```

3) Configure environment variables. Create a `.env` file in `backend/`:

```bash
cat > .env << 'EOF'
SECRET_KEY=change-me
# Optional JWT lifetimes (defaults shown)
ACCESS_TOKEN_LIFETIME=5            # hours
REFRESH_TOKEN_LIFETIME=30          # days
# Frontend host used in CORS/links
FRONTEND_HOST=http://localhost:5173
EOF
```

4) Apply database migrations and create a superuser.

```bash
python manage.py migrate
python manage.py createsuperuser
```

5) Run the development server.

```bash
python manage.py runserver 8000
```

- Backend will be available at `http://localhost:8000/`
- Admin: `http://localhost:8000/admin/`
- API base: `http://localhost:8000/api/v1/`
- API schema (OpenAPI): `http://localhost:8000/api/v1/schema/`
- Swagger UI: `http://localhost:8000/api/v1/docs/`
- Redoc: `http://localhost:8000/api/v1/redoc/`

Notes:
- CORS is open for development (`CORS_ALLOW_ALL_ORIGINS = True`).
- Default DB is SQLite stored at `backend/turbocafe/db.sqlite3`.

---

### Frontend: setup, develop, build

1) Install dependencies.

```bash
cd frontend
npm install
```

2) Start the dev server.

```bash
npm run dev
```

- Vite will start at `http://localhost:5173/` by default.
- The dev server is configured to listen on all interfaces.

3) Build for production.

```bash
npm run build
```

- Build output will be in `frontend/dist/`.

---

### Backend tests

Run all backend tests (auth, menu, orders):

```bash
cd backend
python manage.py test auth menu orders
```

Run tests for a single app:

```bash
python manage.py test auth
python manage.py test menu
python manage.py test orders
```

Run a single test case or method:

```bash
python manage.py test orders.tests.OrderAPITests.test_student_can_cancel_until_ready_or_completed | cat
```

Notes:
- Auth tests expect strong passwords due to Django validators (e.g. use `Str0ng!Passw0rd`).
- JWT uses rotation and blacklist; logout blacklists the latest refresh token. Bearer access token must be set for profile requests.

---

### Serving uploaded images (media)

Image uploads from `ImageField` are stored under `backend/media/menu_images/...` (relative to `MEDIA_ROOT`).

- During development, Django serves media at `http://localhost:8000/media/`.
- Ensure `DEBUG=True` (default) and the server is running with `python manage.py runserver`.

---

### Typical end‑to‑end workflow (local dev)

1) Backend
   - Create `.env`, run `python manage.py migrate`, then `python manage.py runserver 8000` in `backend/`.

2) Frontend
   - Run `npm run dev` in `frontend/` and develop against `http://localhost:8000` API.

---

### Useful paths and endpoints

- Backend API
  - `GET/POST /api/v1/auth/...`
  - `GET/POST /api/v1/menu/...`
  - `GET/POST /api/v1/orders/...`

- Docs
  - Swagger UI: `/api/v1/docs/`
  - Redoc: `/api/v1/redoc/`
  - Schema: `/api/v1/schema/`

---

### Troubleshooting

- If the backend refuses connections, ensure it's running on port 8000 and that `SECRET_KEY` is set in `backend/.env`.
- If the frontend cannot reach the backend, check CORS and that API calls target `http://localhost:8000` in your environment.
- If media URLs 404, check that uploads exist under `backend/media/` and that you are visiting paths under `/media/` while `DEBUG=True`.

