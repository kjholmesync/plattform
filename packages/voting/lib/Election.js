const _ = require('lodash')

const { buildQueries } = require('./queries.js')
const queries = buildQueries('elections')
const {
  findBySlug,
  insertAllowedMemberships
} = queries

const create = async (input, pgdb) => {
  const election = await pgdb.public.elections.insertAndGet(
    _.omit(input, ['allowedMemberships'])
  )

  if (input.allowedMemberships && input.allowedMemberships.length > 0) {
    await insertAllowedMemberships(election.id, input.allowedMemberships, pgdb)
  }

  return findBySlug(input.slug, pgdb)
}

const getCandidacies = async (election, pgdb) => {
  const candidacies = await pgdb.public.electionCandidacies.find({ electionId: election.id })

  const users = candidacies.length > 0
    ? await pgdb.public.users.find({id: candidacies.map(candidacy => candidacy.userId)})
    : []

  const addresses = users.length > 0
    ? await pgdb.public.addresses.find({id: users.map(user => user.addressId)})
    : []

  const usersWithAddresses = users.map(user => ({
    ...user,
    address: addresses.find(address => address.id === user.addressId)
  }))

  const comments = await pgdb.public.comments.find({ discussionId: election.discussionId })

  return candidacies.map(candidacy => ({
    ...candidacy,
    user: usersWithAddresses.find(user => user.id === candidacy.userId),
    election,
    comment: comments.find(comment => comment.id === candidacy.commentId)
  }))
}

module.exports = {
  ...queries,
  create,
  getCandidacies
}
