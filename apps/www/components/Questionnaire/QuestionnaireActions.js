import { css } from 'glamor'
import compose from 'lodash/flowRight'

import {
  Label,
  Button,
  Interaction,
  InlineSpinner,
} from '@project-r/styleguide'

import withT from '../../lib/withT'
import { useMe } from '../../lib/context/MeContext'

const styles = {
  actions: css({
    margin: '15px 0',
    '& button': {
      margin: '5px 20px 5px 0',
    },
  }),
}

export default compose(withT)(
  ({
    t,
    onSubmit,
    onReset,
    isResubmitAnswers,
    updating,
    invalid,
    hideInvalid = false,
    publicSubmission,
  }) => {
    const { me } = useMe()
    return (
      <div {...styles.actions}>
        {publicSubmission && (
          <div style={{ marginBottom: 10 }}>
            <Label>
              {t(
                `questionnaire/privacy/${
                  me?.hasPublicProfile ? 'public' : 'private'
                }`,
              )}
            </Label>
          </div>
        )}
        <Button primary onClick={onSubmit} disabled={updating || invalid}>
          {updating ? (
            <InlineSpinner size={40} />
          ) : (
            t(
              `questionnaire/${
                isResubmitAnswers
                  ? 'update'
                  : publicSubmission
                  ? 'publish'
                  : 'submit'
              }`,
            )
          )}
        </Button>
        {invalid && !hideInvalid ? (
          <Interaction.P>{t('questionnaire/invalid')}</Interaction.P>
        ) : (
          !!onReset && (
            <Button
              onClick={() => {
                if (window.confirm(t('questionnaire/reset/confirm'))) {
                  onReset()
                }
              }}
              style={{ padding: 0 }}
              small
              naked
            >
              {t('questionnaire/reset')}
            </Button>
          )
        )}
      </div>
    )
  },
)
