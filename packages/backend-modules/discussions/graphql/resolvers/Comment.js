const crypto = require('crypto')

const { Roles } = require('@orbiting/backend-modules-auth')
const { slateToString } = require('@orbiting/backend-modules-utils')

const {
  portrait: getPortrait,
  name: getName,
  slug: getSlug,
} = require('@orbiting/backend-modules-republik/graphql/resolvers/User')
// const { clipNamesInText } = require('../../lib/nameClipper')
// const { stripUrlFromText } = require('../../lib/urlStripper')
const { getEmbedByUrl } = require('@orbiting/backend-modules-embeds')

const { DISPLAY_AUTHOR_SECRET, ASSETS_SERVER_BASE_URL } = process.env
if (!DISPLAY_AUTHOR_SECRET) {
  throw new Error('missing required DISPLAY_AUTHOR_SECRET')
}

const embedForComment = async (
  { embedUrl, discussionId, depth, published, adminUnpublished },
  context,
) => {
  if (!embedUrl) {
    return null
  }
  if (!(published && !adminUnpublished)) {
    return null
  }
  const discussion = await context.loaders.Discussion.byId.load(discussionId)
  if (discussion && discussion.isBoard && depth === 0) {
    return getEmbedByUrl(embedUrl, context)
  }
  return null
}

/**
 * Return processed content by either
 * - suppressing it, user should not see it
 * - clip names
 * - strip embed URL from nodes
 *
 */
const processContent = async (comment, strip = false, context) => {
  const {
    userId,
    content,
    published,
    adminUnpublished,
    // discussionId,
    // embedUrl,
  } = comment
  const { user: me } = context

  const isPublished = !!(published && !adminUnpublished)
  const isMine = !!(me && userId && userId === me.id)
  if (!isMine && !isPublished) {
    return []
  }

  // @TODO: clipNamesInText
  // @TODO: stripUrlFromText (embedUrl)

  return content
}

/**
 * Stringify Slate tree and trim it to a length.
 *
 */
const slateToTrimmedString = (children, length = 500) => {
  let string = ''
  const tokens = slateToString(children).split(/\s+/).filter(Boolean)

  // TODO: mdastCollapseLink (for Slate)

  do {
    const token = tokens.shift()

    if (!token || string.length + token.length > length) {
      break
    }

    string += `${token} `
  } while (string.length <= length && tokens.length > 0)

  return { string: string.trim(), more: tokens.length > 0 }
}

module.exports = {
  discussion: ({ discussion, discussionId }, args, { loaders }) =>
    loaders.Discussion.byId.load(discussionId),

  published: ({ published, adminUnpublished }) =>
    published && !adminUnpublished,

  content: (comment, args, context) =>
    processContent(comment, !!args.strip, context),

  text: async (comment, args, context) => {
    const content = await processContent(comment, false, context)
    return slateToString(content, '\n')
  },

  featuredText: ({
    published,
    adminUnpublished,
    featuredAt,
    featuredContent,
  }) =>
    published && !adminUnpublished && featuredAt && featuredContent
      ? featuredContent
      : null,

  preview: async (comment, { length = 500 }, context) => {
    const content = await processContent(comment, false, context)
    return slateToTrimmedString(content, length)
  },

  embed: (comment, args, context) => embedForComment(comment, context),

  contentLength: async (comment, args, context) => {
    const { embedUrl, userId } = comment
    const { user: me } = context

    if (me?.id !== userId) {
      return null
    }

    const content = await processContent(comment, false, context)
    return slateToString(content).length - (embedUrl?.length || 0)
  },

  upVotes: (comment) => {
    const { published, adminUnpublished, upVotes } = comment
    return (published && !adminUnpublished && upVotes) || 0
  },

  downVotes: (comment) => {
    const { published, adminUnpublished, downVotes } = comment
    return (published && !adminUnpublished && downVotes) || 0
  },

  score: (comment) => {
    const { published, adminUnpublished, upVotes, downVotes } = comment
    return (published && !adminUnpublished && upVotes - downVotes) || 0
  },

  userCanEdit: ({ userId }, args, { user }) => user && userId === user.id,

  userVote: (comment, args, { user: me }) => {
    const { published, adminUnpublished, votes } = comment
    const userVote = me && votes.find((vote) => vote.userId === me.id)

    if (published && !adminUnpublished && userVote) {
      return userVote.vote === -1 ? 'DOWN' : 'UP'
    }

    return null
  },

  parentIds: ({ parentIds }) => parentIds || [],

  parent: ({ parentIds }, args, { loaders }, info) => {
    if (!parentIds) {
      return null
    }
    const parentId = parentIds.slice(-1).pop()
    const selections = info.fieldNodes[0].selectionSet.selections
    if (selections.length === 1 && selections[0].name.value === 'id') {
      return {
        id: parentId,
      }
    }
    return loaders.Comment.byId.load(parentId)
  },

  author: async (comment, args, { user, loaders }) => {
    if (!comment.userId || !Roles.userIsInRoles(user, ['admin'])) {
      return null
    }
    return loaders.User.byId.load(comment.userId)
  },

  displayAuthor: async (comment, args, context) => {
    const { user: me, t, loaders } = context

    const user =
      !!comment.userId && (await loaders.User.byId.load(comment.userId))

    if (
      (!comment.published && !Roles.userIsMe(user, me)) ||
      comment.adminUnpublished
    ) {
      return {
        id: 'hidden',
        name: t('api/comment/hidden/displayName'),
        profilePicture: null,
        anonymity: true,
        username: null,
      }
    }

    const id = crypto
      .createHmac('sha256', DISPLAY_AUTHOR_SECRET)
      .update(`${comment.discussionId}${comment.userId ? comment.userId : ''}`)
      .digest('hex')

    const anonymousComment = {
      id,
      name: t('api/comment/anonymous/displayName'),
      profilePicture: null,
      anonymity: true,
      username: null,
    }

    if (!comment.userId) {
      return anonymousComment
    }

    const [discussion, commenter, commenterPreferences] = await Promise.all([
      loaders.Discussion.byId.load(comment.discussionId),
      loaders.User.byId.load(comment.userId),
      loaders.Discussion.Commenter.discussionPreferences.load({
        userId: comment.userId,
        discussionId: comment.discussionId,
      }),
    ])

    const credential = commenterPreferences && commenterPreferences.credential

    let anonymous
    if (discussion.anonymity === 'ENFORCED') {
      anonymous = true
    } else {
      // FORBIDDEN or ALLOWED
      if (commenterPreferences && commenterPreferences.anonymous != null) {
        anonymous = commenterPreferences.anonymous
      } else {
        anonymous = false
      }
    }

    if (
      anonymous &&
      commenterPreferences &&
      commenterPreferences.anonymousDifferentiator !== null
    ) {
      anonymousComment.name = `${t('api/comment/anonymous/displayName')} ${
        commenterPreferences.anonymousDifferentiator
      }`
    }

    const profilePicture = getPortrait(
      commenter,
      args && args.portrait,
      context,
    )
    const name = getName(commenter, null, context)
    const slug = getSlug(commenter, null, context)

    return anonymous
      ? {
          ...anonymousComment,
          credential,
        }
      : {
          id,
          name: name || t('api/noname'),
          profilePicture: profilePicture,
          credential,
          anonymity: false,
          username: slug,
          slug,
        }
  },

  comments: async (comment, args, { loaders, t }) => {
    if (comment.comments) {
      return comment.comments
    }

    const children = await loaders.Comment.byParentId.load(comment.id)
    const nodes = children.filter(
      (child) => child.parentIds.length === comment.depth + 1,
    )

    if (children) {
      return {
        totalCount: children.length,
        directTotalCount: nodes.length,
        nodes,
      }
    }

    // TODO: why throw here? any why not api/comment/noChildren?
    throw new Error(t('api/unexpected'))
  },

  tags: (comment) => comment.tags || [],

  mentioningDocument: async (
    { mentioningRepoId, mentioningFragmentId: fragmentId },
    args,
    { loaders },
  ) => {
    if (!mentioningRepoId) {
      return null
    }
    const doc = await loaders.Document.byRepoId.load(mentioningRepoId)
    if (doc) {
      return {
        document: doc,
        fragmentId,
        iconUrl: `${ASSETS_SERVER_BASE_URL}/s3/republik-assets/assets/top-storys/top-story-badge.png`,
      }
    }
  },

  userCanReport: ({ userId }, args, { user: me }) => !!(me && me.id !== userId),

  userReportedAt: ({ reports }, args, { user: me }) =>
    me &&
    reports &&
    reports.reduce(
      (acc, r) => (acc || r.userId === me.id ? r.reportedAt : null),
      null,
    ),

  numReports: ({ reports }, args, { user: me }) =>
    Roles.userIsInRoles(me, ['moderator', 'admin'])
      ? reports
        ? reports.length
        : 0
      : null,
}
