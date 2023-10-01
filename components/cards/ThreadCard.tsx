interface Props {
  id: string
  currentUserId: string
  parentId: string | null | undefined
  content: string
  community: {
    name: string
    image: string
    id: string
  } | null
  author: {
    name: string
    image: string
    id: string
  }
  createdAt: string
  comments: {
    author: {
      image: string
    }[]
  }
  isComment?: boolean
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  community,
  createdAt,
  comments,
}: Props) => {
  return <div>ThreadCard</div>
}
export default ThreadCard
