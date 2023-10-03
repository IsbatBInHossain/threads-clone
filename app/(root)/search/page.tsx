import ProfileHeader from '@/components/shared/ProfileHeader'
import { profileTabs } from '@/constants'
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import ThreadsTab from '@/components/shared/ThreadsTab'
import UserCard from '@/components/cards/UserCard'

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

  return (
    <section>
      <h1 className='head-text mb-10'>Search</h1>
      // Search Bar
      <div className='mt-14 flex flex-col gap-9 '>
        {result.users.length === 0 ? (
          <p className='no-result'>No users</p>
        ) : (
          <>
            {result.users.map(person => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                imgUrl={person.image}
                personType='User'
              />
            ))}
          </>
        )}
      </div>
    </section>
  )
}
export default SearchPage
