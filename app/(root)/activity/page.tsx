import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import UserCard from '@/components/cards/UserCard'

const ActivityPage = async () => {
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
  return (
    <section>
      <h1 className='head-text mb-10'>Activity</h1>
    </section>
  )
}
export default ActivityPage
