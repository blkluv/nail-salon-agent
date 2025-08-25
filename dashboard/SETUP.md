# Nail Salon SaaS Setup Instructions

This guide will help you set up the complete nail salon SaaS application with a real database.

## 1. Supabase Setup

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new account or sign in
   - Click "New Project"
   - Choose your organization and enter project details
   - Wait for the project to be created (2-3 minutes)

2. **Get Your Credentials**
   - In your Supabase dashboard, go to **Settings > API**
   - Copy your `Project URL` and `anon/public key`

3. **Set Up Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 2. Database Setup

1. **Create Tables**
   - In your Supabase dashboard, go to **SQL Editor**
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the SQL to create all tables

2. **Add Sample Data**
   - In the SQL Editor, copy the contents of `supabase/seed.sql`
   - Paste and run the SQL to populate with demo data

## 3. Run the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Your application will now be running with real database data!

## 4. Features Now Available

✅ **Real Dashboard Data**: Live stats from database
✅ **Appointment Management**: View real appointments with customer/staff details
✅ **Customer Database**: Actual customer records with history
✅ **Staff Management**: Real staff profiles and schedules
✅ **Service Catalog**: Complete service offerings with pricing
✅ **Analytics**: Charts pulling from real payment/appointment data
✅ **Multi-tenant Ready**: Proper business separation

## 5. Demo Business

The seed data creates "Bella Nails & Spa" with:
- 3 staff members (Maya, Sarah, Jessica, Alex)
- 10 regular customers with visit history  
- 10 different services (manicures, pedicures, nail art)
- ~200 historical appointments over 36 days
- Realistic payment records
- Business hours and staff schedules

## 6. Next Steps

Once running, you can:
- View real appointment data on the dashboard
- Browse customer profiles with actual visit history
- See staff performance metrics
- Analyze revenue trends in analytics
- Test all CRUD operations

## Troubleshooting

**"Business not found" error**: Check your environment variables and ensure BUSINESS_ID matches the one in seed data.

**Database connection issues**: Verify your Supabase credentials and make sure you've run the schema.sql file.

**No data showing**: Make sure you've run the seed.sql file to populate demo data.

## Production Considerations

For production deployment:
- Set up authentication (Supabase Auth recommended)
- Configure RLS (Row Level Security) policies
- Add proper error handling and validation
- Set up automated backups
- Configure monitoring and logging