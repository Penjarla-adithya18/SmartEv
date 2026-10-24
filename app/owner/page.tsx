import { redirect } from 'next/navigation'

export default function OwnerPageRedirect() {
  redirect('/owner/my-stations')
}
