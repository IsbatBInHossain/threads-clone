'use server'

import { FilterQuery, SortOrder } from 'mongoose'
import { revalidatePath } from 'next/cache'

import Community from '../models/Community.model'
import User from '../models/User.model'

import { connectToDB } from '../mongoose'
import Thread from '../models/Thread.model'

interface UpdateUserParams {
  userId: string
  username: string
  name: string
  bio: string
  image: string
  path: string
}

interface FetchUsersProps {
  userId: string
  searchString?: string
  pageNumber?: number
  pageSize?: number
  sortBy: SortOrder
}

export async function fetchUser(userId: string) {
  try {
    connectToDB()

    return await User.findOne({ id: userId }).populate({
      path: 'communities',
      model: Community,
    })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`)
  }
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: UpdateUserParams): Promise<void> {
  try {
    connectToDB()

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    )

    if (path === '/profile/edit') {
      revalidatePath(path)
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`)
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB()

    // TODO Populate community
    const threads = await User.findOne({ id: userId }).populate({
      path: 'threads',
      model: Thread,
      populate: {
        path: 'children',
        model: Thread,
        populate: {
          path: 'author',
          model: User,
          select: 'name image id',
        },
      },
    })

    return threads
  } catch (error: any) {
    throw new Error(`Error fetching post: ${error.message}`)
  }
}

export async function fetchUsers({
  userId,
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: FetchUsersProps) {
  try {
    connectToDB()

    const skip = (pageNumber - 1) * pageSize

    const regex = new RegExp(searchString, 'i')

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    }

    if (searchString.trim() !== '') {
      query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }]
    }

    const sortOptions = { createdAt: sortBy }

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize)

    const totalUsersCount = await User.countDocuments(query)

    const users = await usersQuery.exec()
    const isNext = totalUsersCount > skip + users.length

    return { users, isNext }
  } catch (error: any) {
    throw new Error(`Error fetching Users: ${error.message}`)
  }
}

export async function getNotification(userId: string) {
  try {
    connectToDB()

    // find all the threads created by the user
    const userThreads = await Thread.find({ author: userId })

    // collect all the child thread ids (replies) from the children field

    const childThreadIds = userThreads.reduce(
      (acc, userThread) => acc.concat(userThread.children),
      []
    )

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id',
    })

    return replies
  } catch (error: any) {
    throw new Error(`Error getting notification: ${error.message}`)
  }
}
