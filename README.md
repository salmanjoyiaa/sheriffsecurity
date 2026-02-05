# Sheriff Security Management Platform

<p align="center">
  <img src="/public/logo.png" alt="Sheriff Security Logo" width="200" />
</p>

<p align="center">
  <strong>The Name of Conservation</strong><br />
  A comprehensive multi-tenant security management platform for Sheriff Security Company Pvt. Ltd
</p>

---

## 🏢 About

Sheriff Security Company Pvt. Ltd, established in 2004, is a leading security services provider in Pakistan. This platform helps manage:

- **Multiple Branches** - Manage security operations across different cities
- **Places/Clients** - Track client locations requiring security services
- **Guards** - Complete guard roster management with photos and documents
- **Assignments** - Assign guards to places with shift management
- **Attendance** - Daily attendance tracking with multiple status types
- **Inventory** - Equipment and asset management
- **Invoices** - Client billing and payment tracking
- **Reports** - Comprehensive attendance and performance reports

## 🚀 Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Form Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

## 🎨 Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Maroon) | `#8B1A1A` | Main brand color, buttons, accents |
| Secondary (Gold) | `#FFD700` | Highlights, badges, secondary actions |
| Accent (Green) | `#2E7D32` | Success states, confirmations |

## 📁 Project Structure

```
sheriff-security/
├── app/
│   ├── (auth)/               # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/          # Public marketing pages
│   │   ├── about/
│   │   ├── services/
│   │   ├── contact/
│   │   └── page.tsx          # Homepage
│   ├── dashboard/            # Protected admin area
│   │   ├── branches/
│   │   ├── places/
│   │   ├── guards/
│   │   ├── assignments/
│   │   ├── attendance/
│   │   ├── inventory/
│   │   ├── invoices/
│   │   ├── reports/
│   │   ├── settings/
│   │   ├── layout.tsx
│   │   └── page.tsx          # Dashboard home
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Browser client
│   │   └── server.ts         # Server client
│   └── utils.ts              # Utility functions
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_update_company_settings.sql
│   └── 004_seed_data.sql
├── public/
│   ├── logo.png
│   └── ...
├── .env.example
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🔐 User Roles

### Super Admin
- Full access to all branches and data
- Can manage all modules
- Access to company settings
- Can view organization-wide reports

### Branch Admin
- Access limited to assigned branch only
- Can manage places, guards, assignments within their branch
- Can mark attendance and manage inventory
- Can generate branch-specific reports

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sheriff-security
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Set up Supabase Database**
   
   Run the migrations in order in your Supabase SQL Editor:
   - `migrations/001_initial_schema.sql` - Create tables and functions
   - `migrations/002_rls_policies.sql` - Set up Row Level Security
   - `migrations/003_update_company_settings.sql` - Update settings table
   - `migrations/004_seed_data.sql` - (Optional) Add sample data

5. **Create Supabase Storage Buckets**
   
   In Supabase Dashboard → Storage:
   - Create bucket `guard_photos` (Private)
   - Create bucket `company_assets` (Public)

6. **Create a Super Admin User**
   
   In Supabase Dashboard → Authentication → Users:
   - Create a new user with email/password
   - In SQL Editor, update their profile:
   ```sql
   UPDATE profiles 
   SET role = 'super_admin', full_name = 'Your Name'
   WHERE id = 'your-user-id';
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open the application**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Supabase Setup

Ensure these tables exist in your Supabase database:
- `branches`
- `profiles`
- `places`
- `guards`
- `assignments`
- `attendance`
- `inventory_items`
- `inventory_units`
- `inventory_assignments`
- `invoices`
- `invoice_line_items`
- `inquiries`
- `company_settings`

### Storage Buckets

| Bucket | Access | Purpose |
|--------|--------|---------|
| `guard_photos` | Private | Guard profile photos |
| `company_assets` | Public | Company logo, documents |

### RLS Policies

Row Level Security is enabled on all tables. Key policies:
- Super admins can access all data
- Branch admins can only access data within their branch
- Public can insert into `inquiries` table (contact form)

## 📱 Features

### Marketing Website
- **Homepage** - Company overview with hero, services, stats
- **About** - Company history and mission
- **Services** - Detailed service offerings
- **Contact** - Contact form with inquiry submission

### Dashboard Modules

#### 🏢 Branches
- Create and manage branch offices
- Assign branch admins
- View branch statistics

#### 📍 Places
- Manage client locations
- Set guard requirements
- Track contact information

#### 👮 Guards
- Complete guard profiles with photos
- Guard code generation
- Status management (active/inactive)

#### 📋 Assignments
- Assign guards to places
- Shift management (day/night/both)
- Overlap detection

#### ✅ Attendance
- Daily attendance marking
- Bulk attendance for shifts
- Multiple statuses (present, absent, late, half_day, leave)

#### 📦 Inventory
- Track equipment by category
- Serialized item tracking
- Assign items to guards or places

#### 💰 Invoices
- Create client invoices
- Line item management
- Payment status tracking

#### 📊 Reports
- Guard attendance reports
- Place-wise reports
- Date range filtering

#### ⚙️ Settings
- User profile management
- Password change
- Company settings (super admin only)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 License

This project is proprietary software developed for Sheriff Security Company Pvt. Ltd.

## 📞 Contact

**Sheriff Security Company Pvt. Ltd**

- **Address**: Mohalla Nawaban Main Street Jalwana Chock, Bahawalpur 63100
- **Phone**: 03018689990, 03336644631, 03018689994
- **Email**: sheriffsgssc@gmail.com

---

<p align="center">
  Made with ❤️ for Sheriff Security Company Pvt. Ltd<br />
  Since 2004 - The Name of Conservation
</p>
