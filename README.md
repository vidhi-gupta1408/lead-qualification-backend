# Lead Qualification Backend Service

A comprehensive backend service for lead qualification that scores prospects using rule-based logic and AI reasoning. Built for the Backend Engineer hiring assignment.

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js 20+** (recommended: use Node.js 20 or higher)
- **npm** (comes with Node.js)
- **OpenAI API Key** (for AI-powered lead analysis)

### Step-by-Step Setup

#### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd lead-qualification-backend

# Install all dependencies
npm install
```

#### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
SESSION_SECRET=your_session_secret_here
```

**How to get an OpenAI API Key:**
1. Go to [openai.com](https://openai.com)
2. Create an account and sign in
3. Navigate to API → API Keys
4. Click "Create new secret key"
5. Copy the key and paste it in your `.env` file

#### 3. Start the Application

```bash
# Run the development server
npm run dev
```

The application will start on **http://localhost:5000**

You should see:
```
[express] serving on port 5000
```

#### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

You'll see the Lead Qualification Platform interface with a 3-step process.

## 📖 How to Use the Application

### Step 1: Create Product/Offer

1. Fill in the **Product Name** (e.g., "AI Outreach Automation")
2. Add **Value Propositions** (one per line):
   ```
   24/7 outreach
   6x more meetings
   Automated follow-ups
   ```
3. Add **Ideal Use Cases** (one per line):
   ```
   B2B SaaS mid-market
   Enterprise sales teams
   ```
4. Click **Save Product Details**

### Step 2: Upload Leads CSV

Create a CSV file with the following format:
```csv
name,role,company,industry,location,linkedin_bio
John Smith,VP Sales,TechCorp,SaaS,San Francisco,Experienced sales leader with 10+ years in B2B SaaS
Jane Doe,Marketing Manager,StartupXYZ,Technology,New York,Growth marketing expert focused on lead generation
```

**Required CSV columns:**
- `name` - Full name of the prospect
- `role` - Job title/position
- `company` - Company name
- `industry` - Industry sector
- `location` - Geographic location
- `linkedin_bio` - Brief bio or description

1. Click the upload area or drag & drop your CSV file
2. Click **Upload Leads**

### Step 3: Score Leads

1. Click **Start Scoring Pipeline**
2. Wait for the AI analysis to complete (~30 seconds)
3. View results in the results table

## 🔗 API Endpoints

### POST /api/offer
Accept product/offer details.

**Request:**
```bash
curl -X POST http://localhost:5000/api/offer \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Outreach Automation",
    "value_props": ["24/7 outreach", "6x more meetings"],
    "ideal_use_cases": ["B2B SaaS mid-market"]
  }'
```

### POST /api/leads/upload
Upload CSV file with leads.

**Request:**
```bash
curl -X POST http://localhost:5000/api/leads/upload \
  -F "csvFile=@leads.csv"
```

### POST /api/score
Run scoring pipeline on uploaded leads.

**Request:**
```bash
curl -X POST http://localhost:5000/api/score
```

### GET /api/results
Get scoring results.

**Request:**
```bash
curl http://localhost:5000/api/results
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Smith",
      "role": "VP Sales",
      "company": "TechCorp",
      "industry": "SaaS",
      "location": "San Francisco",
      "intent": "High",
      "score": 85,
      "reasoning": "Rules: Decision maker role (+20), Exact industry match (+20), Complete data (+10). AI: Strong fit for B2B SaaS automation needs."
    }
  ]
}
```

### GET /api/results/csv
Export results as CSV file.

**Request:**
```bash
curl http://localhost:5000/api/results/csv -o results.csv
```

## 🎯 Scoring Logic

### Rule-Based Layer (Max 50 Points)

1. **Role Relevance:**
   - Decision maker roles: +20 points
     - CEO, CTO, CFO, VP, Director, Head of, Chief, Founder, Owner, President, GM
   - Influencer roles: +10 points
     - Manager, Senior, Lead, Principal, Architect, Specialist, Consultant, Analyst

2. **Industry Match:**
   - Exact ICP match: +20 points
   - Adjacent industry: +10 points
   - Common adjacent matches: SaaS, Software, Tech, B2B

3. **Data Completeness:**
   - All required fields present: +10 points

### AI Layer (Max 50 Points)

Uses **OpenAI GPT-5** to analyze prospect context and classify intent:

- **High Intent:** +50 points
- **Medium Intent:** +30 points  
- **Low Intent:** +10 points

The AI considers:
- Role-to-product fit
- Company context and industry
- LinkedIn bio relevance
- Overall buying potential

## 🛠 Development

### Project Structure

```
├── server/                 # Backend Express.js server
│   ├── services/          
│   │   ├── openai.ts      # OpenAI integration
│   │   └── scoring.ts     # Scoring pipeline logic
│   ├── routes.ts          # API routes
│   ├── storage.ts         # In-memory data storage
│   └── index.ts           # Server entry point
├── client/                # Frontend React application
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       └── lib/           # Utilities and API client
├── shared/                # Shared types and schemas
│   └── schema.ts          # Data models and validation
└── package.json
```

### Available Scripts

```bash
# Start development server (frontend + backend)
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Database operations (if using persistence)
npm run db:generate    # Generate migrations
npm run db:push        # Push schema changes
```

### Environment Variables

```env
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
SESSION_SECRET=your_session_secret_here
NODE_ENV=development
PORT=5000
```

## 🧪 Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Navigate to http://localhost:5000
3. Follow the 3-step process:
   - Create an offer
   - Upload sample CSV
   - Run scoring pipeline
4. Verify results display correctly

### API Testing with cURL

Test each endpoint individually:

```bash
# 1. Create offer
curl -X POST http://localhost:5000/api/offer \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product", "value_props": ["benefit1"], "ideal_use_cases": ["use case1"]}'

# 2. Upload leads (prepare test.csv first)
curl -X POST http://localhost:5000/api/leads/upload \
  -F "csvFile=@test.csv"

# 3. Score leads
curl -X POST http://localhost:5000/api/score

# 4. Get results
curl http://localhost:5000/api/results

# 5. Export CSV
curl http://localhost:5000/api/results/csv -o results.csv
```

## 🚨 Troubleshooting

### Common Issues

1. **"Error: OpenAI API key not found"**
   - Ensure your `.env` file contains `OPENAI_API_KEY=your_key_here`
   - Restart the server after adding the key

2. **"CSV upload failed"**
   - Check CSV format matches required columns exactly
   - Ensure file size is under 5MB
   - Verify no empty rows or malformed data

3. **"Scoring failed"**
   - Ensure you've uploaded leads first
   - Check your OpenAI API key has sufficient credits
   - Verify internet connection for AI API calls

4. **"Port 5000 already in use"**
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`
   - Or change port in `server/index.ts`

### Logs and Debugging

Check the console output for detailed error messages:
```bash
npm run dev
# Watch the console for error messages and logs
```

## 📋 Sample Data

### Sample CSV (save as `sample-leads.csv`):

```csv
name,role,company,industry,location,linkedin_bio
Sarah Johnson,VP of Sales,CloudTech Solutions,SaaS,Austin,Seasoned sales executive with 12+ years driving revenue growth in B2B SaaS companies
Mike Chen,CTO,DataFlow Inc,Technology,Seattle,Technical leader passionate about AI and machine learning solutions for enterprise clients
Emma Rodriguez,Marketing Manager,GrowthCorp,Digital Marketing,Miami,Growth marketing specialist focused on lead generation and conversion optimization
David Kim,Senior Developer,CodeBase,Software,San Francisco,Full-stack developer with expertise in building scalable web applications
Lisa Thompson,CEO,StartupXYZ,FinTech,New York,Entrepreneur building innovative financial technology solutions for small businesses
```

This CSV contains a mix of high-value (decision makers in tech) and medium-value prospects to demonstrate the scoring system.

## 🌐 Deployment

This application is ready for deployment on platforms like:
- Heroku
- Railway
- Render
- Vercel
- AWS/Google Cloud

Remember to set environment variables in your deployment platform.

## 📝 Notes

- The application uses in-memory storage by default (data resets on server restart)
- For production use, consider adding database persistence
- The AI scoring provides intelligent context analysis beyond simple rule matching
- All API responses include proper error handling and validation