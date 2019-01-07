const _ = require('lodash')
const checkEnv = require('check-env')
const debug = require('debug')('mail:lib:sendMailTemplate')
const fs = require('fs')
const path = require('path')

const MandrillInterface = require('../MandrillInterface')
const { send } = require('./mailLog')
const shouldSendMessage = require('../utils/shouldSendMessage')
const sendResultNormalizer = require('../utils/sendResultNormalizer')

checkEnv([
  'DEFAULT_MAIL_FROM_ADDRESS',
  'DEFAULT_MAIL_FROM_NAME'
])

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  DEFAULT_MAIL_FROM_NAME,
  SEND_MAILS_TAGS,
  FRONTEND_BASE_URL
} = process.env

const getTemplate = (name) => {
  const templatePath = path.resolve(`${__dirname}/../templates/${name}.html`)

  if (!fs.existsSync(templatePath)) {
    debug(`template "${name}" not found in templates folder`, { templatePath })
    return false
  }

  const contents = fs.readFileSync(templatePath, 'utf8')
  return contents
}

// usage
// sendMailTemplate({
//  to: 'p@tte.io',
//  fromEmail: 'jefferson@project-r.construction',
//  fromName: 'Jefferson',
//  subject: 'dear friend',
//  templateName: 'MANDRIL TEMPLATE',
//  globalMergeVars: {
//    name: 'VARNAME',
//    content: 'replaced with this'
//  }
// })
module.exports = async (mail, context, log) => {
  // sanitize
  const tags = [].concat(
    SEND_MAILS_TAGS && SEND_MAILS_TAGS.split(',')
  ).filter(Boolean)

  const mergeVars = [
    ...mail.globalMergeVars || []
  ]

  if (FRONTEND_BASE_URL) {
    mergeVars.push({
      name: 'frontend_base_url',
      content: FRONTEND_BASE_URL
    })
  }

  const message = {
    to: [{email: mail.to}],
    subject: mail.subject,
    from_email: mail.fromEmail || DEFAULT_MAIL_FROM_ADDRESS,
    from_name: mail.fromName || DEFAULT_MAIL_FROM_NAME,
    html: getTemplate(mail.templateName),
    merge_language: mail.mergeLanguage || 'mailchimp',
    global_merge_vars: mergeVars,
    auto_text: true,
    tags
  }

  debug(_.omit(message, 'html'))

  const shouldSend = shouldSendMessage(message)

  const sendFunc = sendResultNormalizer(
    shouldSend,
    () => MandrillInterface({ logger: console }).send(
      message,
      !message.html ? mail.templateName : false,
      []
    )
  )

  return send({
    log,
    sendFunc,
    message,
    email: message.to[0].email,
    template: mail.templateName,
    context
  })
}

module.exports.getTemplate = getTemplate
