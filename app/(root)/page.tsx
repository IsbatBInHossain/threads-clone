import ThreadCard from '@/components/cards/ThreadCard'
import { fetchThreads } from '@/lib/actions/thread.actions'
import { currentUser } from '@clerk/nextjs'

export default async function Home() {
  const threads = await fetchThreads(1, 20)

  const user = await currentUser()

  return (
    <>
      <h1 className='head-text text-left'>Home</h1>
      <section className='mt-9 flex flex-col gap-10'>
        {threads.threads.length === 0 ? (
          <p className=' no-result'>No threads found</p>
        ) : (
          <>
            {threads.threads.map(thread => (
              <ThreadCard
                key={thread.id}
                id={thread.id}
                currentUserId={user?.id || ''}
                parentId={thread.parentId}
                author={thread.author}
                content={thread.text}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  )
}
