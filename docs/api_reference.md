# 📡 API REFERENCE (ENDPOINTS & ACTIONS)

### Key Pages (Routes)
| Route | Description | Access |
| :--- | :--- | :--- |
| `/` | Landing page. | Public |
| `/login` | Sign in page with Google Auth button. | Public |
| `/dashboard` | Main user area. Redirects to Login if not auth. | Protected |

### REST API Routes (Next.js)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Checks if user is logged in via cookies. Supports CORS for extension. | No (returns false) |
| `GET` | `/auth/callback` | OAuth callback handler. Exchanges code for session. | No |
| `GET` | `/api/profiles` | Returns list of job profiles for the current user. | Yes (Cookie) |
| `POST` | `/api/analyze-job` | Analyzes job description text using LLM. Returns structured JSON. | Yes (Cookie) |
| `POST` | `/api/applications` | Creates a new job application. Used by browser extension. | Yes (Cookie) |

### Server Actions (`src/actions/`)
| Function Name | Description | Inputs | Returns |
| :--- | :--- | :--- | :--- |
| `signOutAction` | Signs out the user and redirects to `/login`. | `void` | `void` (Redirects) |
| `createJobProfile` | Creates a new job profile. | `name: string` | `{ success, data: Profile }` |
| `getJobProfiles` | Fetches all profiles for the current user. | `void` | `{ success, data: Profile[] }` |
| `updateApplicationStatus` | Updates the status of a job application. | `id: string, status: string` | `{ success, error? }` |
| `updateApplicationIndustry` | Updates the industry of a job application. | `id: string, industry: string` | `{ success, error? }` |
