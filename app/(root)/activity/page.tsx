import { fetchUser, getNotification } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const ActivityPage = async () => {
  const user = await currentUser()
  if (!user) return null
  const userInfo = await fetchUser(user.id)

  if (!userInfo.onboarded) redirect('/onboarding')

  // getActivity
  const notifications = await getNotification(userInfo._id)

  return (
    <section>
      <h1 className='head-text mb-10'>Activity</h1>
      <section className='mt-10 flex flex-col gpa-5'>
        {notifications.length > 0 ? (
          <>
            {notifications.map(notification => (
              <Link
                key={notification._id}
                href={`/thread/${notification.parentId}`}
              >
                <article className='activity-card'>
                  <Image
                    src={notification.author.image}
                    alt='Profile Picture'
                    width={20}
                    height={20}
                    className='rounded-full object-cover'
                  />
                  <p className='!text-small-regular text-light-1 ml-2'>
                    <span className=' mr-1 text-primary-500'>
                      {notification.author.name}
                    </span>{' '}
                    repled to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className='!text-base-regular text-light-3'>No new activities</p>
        )}
      </section>
    </section>
  )
}
export default ActivityPage
