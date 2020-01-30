const hotness = require('../hotness')
const { getUrls: { getUrlsFromText } } = require('@orbiting/backend-modules-utils')

const getUrls = (content) => {
  const urls = getUrlsFromText(content) || null
  return {
    urls,
    embedUrl: urls && urls.length
      ? urls[urls.length - 1]
      : null
  }
}

const create = async (
  {
    id,
    discussionId,
    parentId,
    userId,
    content,
    tags,
    now = new Date()
  },
  {
    loaders,
    t
  }
) => {
  let parentIds
  if (parentId) {
    const parent = await loaders.Comment.byId.load(parentId)
    if (!parent) {
      throw new Error(t('api/comment/parent/404'))
    }
    parentIds = [...(parent.parentIds || []), parentId]
  }

  return {
    ...id ? { id } : { },
    discussionId,
    ...parentIds ? { parentIds } : {},
    depth: (parentIds && parentIds.length) || 0,
    userId,
    content,
    ...getUrls(content),
    hotness: hotness(0, 0, (now.getTime())),
    ...tags ? { tags } : {},
    createdAt: now,
    updatedAt: now
  }
}

const edit = ({
  content,
  tags,
  now = new Date()
}) => ({
  content,
  ...getUrls(content),
  ...tags ? { tags } : {},
  published: true,
  updatedAt: now
})

module.exports = {
  create,
  edit
}
