'use server'

import { revalidatePath } from 'next/cache'
import User from '../models/User.model'
import Thread from '../models/Thread.model'
import { connectToDB } from '../mongoose'

interface CreateThreadParams {
  text: string
  author: string
  communityId: string | null
  path: string
}

interface AddCommentToThreadParams {
  threadId: string
  commentText: string
  userId: string
  path: string
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: CreateThreadParams) {
  connectToDB()

  try {
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

  try {
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
  } catch (error: any) {
    throw new Error(`Error fetching threads: ${error.message}`)
  }
}

export async function fetchThreadById(id: string) {
  connectToDB()
  try {
    // TODO: Populate community

    const thread = await Thread.findById(id)
      .populate({
        path: 'author',
        model: User,
        select: '_id id name image',
      })
      .populate({
        path: 'children',
        populate: [
          {
            path: 'author',
            model: User,
            select: '_id id name parentId image',
          },
          {
            path: 'children',
            model: Thread,
            populate: {
              path: 'author',
              model: User,
              select: '_id id name parentId image',
            },
          },
        ],
      })
      .exec()

    return thread
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`)
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: AddCommentToThreadParams) {
  connectToDB()

  try {
    // Find the original thread
    const originalThread = await Thread.findById(threadId)

    if (!originalThread) throw new Error('Thread not found')

    // Create new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    })

    // Save the new comment thread
    const savedCommentThread = await commentThread.save()

    // Update the original thread to include the new thread
    originalThread.children.push(savedCommentThread._id)

    //Save the original thread
    await originalThread.save()

    revalidatePath(path)
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`)
  }
}
