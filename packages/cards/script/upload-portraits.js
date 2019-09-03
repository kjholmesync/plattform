#!/usr/bin/env node
require('@orbiting/backend-modules-env').config()

const path = require('path')
const recursive = require('recursive-readdir')
const Promise = require('bluebird')
const yargs = require('yargs')
const { promises: fs } = require('fs')

const argv = yargs
  .option('path', {
    alias: 'p',
    required: true,
    coerce: input => path.resolve('./', input)
  })
  .argv

const { lib: { Portrait } } = require('@orbiting/backend-modules-assets')
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

PgDb.connect().then(async pgdb => {
  console.log('Loading file list...')
  const files = await recursive(path.join(argv.path, '/triage'), ['.*'])

  await Promise.map(
    files.filter(file => !file.match(/(Icon\r$)/g)),
    async file => {
      console.log(file)
      const portrait = await fs.readFile(file)
      const cardUserId = file.match(/\/(\d+)\..+$/, '$1')[1]
      const userId = await pgdb.public.queryOneField(`
        SELECT u.id
        FROM cards c
        JOIN
          users u ON u.id = c."userId"
          AND email LIKE 'wahl2019-%@republik.ch'
          AND "portraitUrl" IS NULL
        WHERE
          c.payload->'meta'->>'userId' = :cardUserId
      `, { cardUserId })

      if (userId) {
        const portraitUrl = await Portrait.upload(portrait)
        await pgdb.public.users.update({ id: userId }, { portraitUrl, updatedAt: new Date() })
      }
    },
    { concurrency: 5 }
  )

  console.log('Done.')

  await pgdb.close()
}).catch(console.error)
