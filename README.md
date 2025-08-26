# MWIT Student Committee Print System

A modern web-based printing system for MWIT Student Committee with Google OAuth authentication, print management, and Python-based printer communication.

## Features

- 🔐 **Google OAuth Authentication** - Only @mwit.ac.th emails allowed
- 🌓 **Dark/Light Mode** - Theme toggle with red color scheme
- 📄 **File Upload** - Support for PDF, Word documents, and text files
- 🖨️ **Print Management** - Custom settings for copies, draft mode, color, orientation, and page ranges
- 📊 **Print History** - Dashboard showing all print jobs with status tracking
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Print API**: Python FastAPI for printer communication
- **Authentication**: Google OAuth with domain restriction

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd sc-printer
npm install
```

### 2. Database Setup

1. Install PostgreSQL and create a database named `sc_printer`
2. Update the `DATABASE_URL` in `.env.local`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/sc_printer"
```

3. Run Prisma migrations:

```bash
npx prisma db push
npx prisma generate
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
6. Update `.env.local`:

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Create Required Directories

```bash
mkdir -p public/uploads public/print
```

### 5. Start Python Print API

```bash
cd python-api
python3 run.py
```

The Python API will run on `http://localhost:8000`

### 6. Start Next.js Development Server

```bash
npm run dev
```

The web application will be available at `http://localhost:3000`

## Usage

1. **Sign In**: Visit the website and sign in with your @mwit.ac.th Google account
2. **Upload Document**: Click "Print Document" to open the print dialog
3. **Configure Settings**: 
   - Select number of copies (1-10)
   - Toggle draft mode for faster printing
   - Choose color or black & white
   - Set orientation (portrait/landscape)
   - Specify page ranges (e.g., "1-3,5,7-10" or "all")
   - Select an available printer
4. **Print**: Click "Print" to send the job to the printer
5. **Monitor**: View print history and status on the dashboard

## API Endpoints

### Next.js API Routes
- `POST /api/upload` - Upload and save print files
- `POST /api/print` - Send print commands to Python API
- `GET /api/printers` - Fetch available printers from Python API

### Python Print API
- `GET /printers` - Get all available printers
- `POST /print` - Execute print job
- `GET /health` - Health check endpoint

## Database Schema

### Users
- Email, name, profile image
- Linked to print jobs

### PrintJobs
- File information (name, path, size, type)
- Print settings (copies, color, orientation, pages)
- Printer selection and job status
- Timestamps for tracking

### Printers
- Printer name, online status, driver information

## Security Features

- Domain-restricted authentication (@mwit.ac.th only)
- File type validation (PDF, DOC, DOCX, TXT only)
- User isolation (users can only see their own print jobs)
- Secure file handling with timestamps

## Development

- **Frontend**: Edit files in `src/` directory
- **API**: Modify routes in `src/app/api/`
- **Database**: Update schema in `prisma/schema.prisma`
- **Print Logic**: Modify `python-api/main.py`

## Troubleshooting

1. **Database Connection Issues**: Verify PostgreSQL is running and connection string is correct
2. **Google Auth Errors**: Check OAuth credentials and redirect URIs
3. **Printer Not Found**: Ensure printers are installed and accessible to the system
4. **File Upload Fails**: Check directory permissions for `public/uploads` and `public/print`
5. **Python API Errors**: Verify Python dependencies are installed and port 8000 is available

## License

This project is for MWIT Student Committee internal use.