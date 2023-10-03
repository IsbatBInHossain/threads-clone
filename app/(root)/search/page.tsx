import ProfileHeader from '@/components/shared/ProfileHeader'
import { profileTabs } from '@/constants'
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ThreadsTab from '@/components/shared/ThreadsTab'

const SearchPage = async () => {
  const user = await currentUser()
  if (!user) return null
  const userInfo = await fetchUser(user.id)

  // Fetch Users

  const result = await fetchUsers({
    userId: user.id,
    searchString: '',
    pageNumber: 1,
    pageSize: 25,
    sortBy: 'desc',
  })

  if (!userInfo.onboarded) redirect('/onboarding')

  return <h1 className='head-text mb-10'>Search</h1>
}
export default SearchPage
