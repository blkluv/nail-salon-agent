import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard - this is the landing page
  redirect('/dashboard')
}