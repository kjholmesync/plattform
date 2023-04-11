import { useState } from 'react'
import { css } from 'glamor'
import { useTranslation } from '../../lib/withT'
import { userProlitterisConsentFragment } from '../../lib/apollo/withMe'

import Box from '../Frame/Box'
import ErrorMessage from '../ErrorMessage'
import { P } from './Elements'
import { InlineSpinner, Checkbox, Loader } from '@project-r/styleguide'

import { getFeatureDescription } from '../Article/Progress'
import { gql, useMutation } from '@apollo/client'
import { useMe } from '../../lib/context/MeContext'

const styles = {
  headline: css({
    margin: '80px 0 30px 0',
  }),
  spinnerWrapper: css({
    display: 'inline-block',
    height: 0,
    marginLeft: 15,
    verticalAlign: 'middle',
    '& > span': {
      display: 'inline',
    },
  }),
  label: css({
    display: 'block',
    paddingLeft: '28px',
  }),
}

const CONSENT_TO_PROLITTERIS = gql`
  mutation submitConsent {
    submitConsent(name: "PROLITTERIS") {
      id
      ...ProlitterisConsent
    }
  }
  ${userProlitterisConsentFragment}
`

const REVOKE_PROLITTERIS = gql`
  mutation revokeConsent {
    revokeConsent(name: "PROLITTERIS") {
      id
      ...ProlitterisConsent
    }
  }
  ${userProlitterisConsentFragment}
`

const ProlitterisSettings = () => {
  const { me, meLoading, hasAccess } = useMe()
  const { t } = useTranslation()
  const [revokeConsent] = useMutation(REVOKE_PROLITTERIS)
  const [submitConsent] = useMutation(CONSENT_TO_PROLITTERIS)
  const [mutating, isMutating] = useState(false)
  const [serverError, setServerError] = useState(false)
  const hasAccepted = me && me.prolitterisConsent === true

  return (
    <Loader
      loading={meLoading}
      render={() => (
        <>
          <P style={{ margin: '20px 0' }}>
            Unsere Autorinnen bekommen von der Schweizer Verwertungsgesellschaft
            ProLitteris Entschädigung. Diese wird auf Basis von
            Beitragszugriffen und mit Hilfe anonymisierten IP Adressen der
            Leserinnen berechnet. Falls Sie sich trotz Anonymisierung von der
            Enschädigungsprozess abmelden wollen, können Sie es jede Zeit
            machen.
          </P>
          <Checkbox
            checked={hasAccepted}
            disabled={mutating}
            onChange={() => {
              isMutating(true)
              const consentMutation = hasAccepted
                ? revokeConsent
                : submitConsent
              consentMutation()
                .then(() => isMutating(false))
                .catch((err) => {
                  setServerError(err)
                  isMutating(false)
                })
            }}
          >
            <span {...styles.label}>
              {t('account/progress/consent/label')}
              {mutating['consent'] && (
                <span {...styles.spinnerWrapper}>
                  <InlineSpinner size={24} />
                </span>
              )}
            </span>
          </Checkbox>
          {!hasAccess && (
            <Box style={{ margin: '10px 0', padding: 15 }}>
              <P>{t('account/progress/consent/noMembership')}</P>
            </Box>
          )}
          {serverError && <ErrorMessage error={serverError} />}
        </>
      )}
    />
  )
}

export default ProlitterisSettings
