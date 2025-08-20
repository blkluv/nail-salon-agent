# Beauty Booking Dashboard

Modern admin dashboard for the DropFly Beauty Booking Platform.

## Features

- 📊 **Dashboard Overview** - Key metrics and upcoming appointments
- 📅 **Appointment Management** - View, edit, and manage all bookings
- 👥 **Customer Management** - Customer profiles and history
- 👩‍💼 **Staff Management** - Technician schedules and specialties
- 🛍️ **Service Catalog** - Manage services, pricing, and packages
- 📈 **Analytics** - Revenue tracking and business insights
- 🤖 **Voice AI Control** - Manage your Vapi assistant
- 💳 **Billing** - Subscription and payment management

## Getting Started

### Prerequisites

- Node.js 16+ 
- Supabase project with the multi-tenant schema
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
dashboard/
├── app/                    # Next.js 13+ app directory
│   ├── dashboard/         # Main dashboard pages
│   │   ├── appointments/  # Appointment management
│   │   ├── customers/     # Customer management
│   │   ├── staff/         # Staff management
│   │   └── ...
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   └── Layout.tsx         # Dashboard layout with navigation
├── lib/                   # Utilities and database functions
│   └── supabase.ts        # Supabase client and API functions
└── types/                 # TypeScript type definitions
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first styling
- **Headless UI** - Accessible UI components
- **Heroicons** - Beautiful SVG icons
- **Supabase** - Database and real-time subscriptions
- **Recharts** - Chart and analytics components

## Key Components

### Layout
The main layout (`components/Layout.tsx`) provides:
- Responsive sidebar navigation
- Business information display
- Subscription tier indicators
- Mobile-friendly hamburger menu

### Dashboard Pages
Each page is organized under `app/dashboard/`:
- **Dashboard** - Overview with stats and quick actions
- **Appointments** - Full appointment management interface
- **Customers** - Customer profiles and booking history
- **Staff** - Technician management and scheduling
- **Services** - Service catalog and pricing management

### Database Integration
The `lib/supabase.ts` file provides:
- Type-safe database operations
- Business data isolation (multi-tenant)
- Helper functions for common queries
- Real-time subscription capabilities

## Customization

### Styling
The dashboard uses Tailwind CSS with custom color schemes:
- **Brand colors** - Primary blue theme
- **Beauty colors** - Pink/purple accent colors
- **Custom components** - Pre-built button and card styles

### Navigation
Modify the navigation items in `components/Layout.tsx`:
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  // Add your custom pages here
]
```

### Business Logic
Extend the `BusinessAPI` class in `lib/supabase.ts` to add new database operations.

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Other Platforms
The dashboard is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Docker

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support with the dashboard:
- Check the [documentation](../docs/)
- Email: support@dropfly.ai
- Discord: [Join our community](https://discord.gg/dropfly)