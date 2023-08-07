import AccountProfile from '@/components/forms/AccountProfile';
import { currentUser } from '@clerk/nextjs';

export default async function Page() {
  const user = await currentUser();
  const userinfo = {};

  const userData = {
    id: user?.id,
    objectId: userinfo?._id,
    username: userinfo?.username || user?.username,
    name: userinfo?.name || user?.firstName || '',
    bio: userinfo?.bio || '',
    image: userinfo?.image || user?.imageUrl,
  };
  return (
    <main className='mx-auto flex max-w-3xl flex-col justify-start'>
      <h1 className='head-text'>Onboarding</h1>
      <p className='pt-3 text-base-regular text-light-2'>
        Complete your profile now to use Threads
      </p>
      <section className='mt-9 bg-dark-2 p-10'>
        <AccountProfile user={userData} btnTitle='Continue' />
      </section>
    </main>
  );
}
