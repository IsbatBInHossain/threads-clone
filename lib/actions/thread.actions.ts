'use server'

import { revalidatePath } from 'next/cache'
import User from '../models/User.model'
import Thread from '../models/Thread.model'
import { connectToDB } from '../mongoose'

interface Params {
  text: string
  author: string
  communityId: string | null
  path: string
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB()

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    })

    // Update User model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    })

    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`)
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB()

  const skip = (pageNumber - 1) * pageSize

  const threadsQuery = Thread.find({
    parentId: { $in: [null, undefined] },
  })
    .sort({ createdAt: 'desc' })
    .skip(skip)
    .limit(pageSize)
    .populate({ path: 'author', model: User })
    .populate({
      path: 'children',
      populate: {
        path: 'author',
        model: User,
        select: '_id name parentId image',
      },
    })

  const totalThreadsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  })

  const threads = await threadsQuery.exec()
  const isNext = totalThreadsCount > skip + threads.length

  return { threads, isNext }
}
