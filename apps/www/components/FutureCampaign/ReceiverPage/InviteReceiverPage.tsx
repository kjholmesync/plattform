import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import { fontStyles, mediaQueries, plainLinkRule } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../../../lib/constants'
import { useMe } from '../../../lib/context/MeContext'
import { t } from '../../../lib/withT'
import Frame from '../../Frame'
import Stepper, { Step } from '../../Stepper/Stepper'
import { FUTURE_CAMPAIGN_SHARE_IMAGE_URL } from '../constants'
import { useInviteSenderProfileQuery } from '../graphql/useSenderProfileQuery'
import IntroductoryStep from './steps/IntroductionaryStep'
import SelectYourPriceStep from './steps/SelectYourPriceStep'

enum STEPS {
  INTRO = 'INTRO',
  PRICE_SELECTOR = 'PRICE_SELECTOR',
}

export type InviteReceiverPageProps = {
  // If the sender could not be loaded, the link is invalid
  invalidInviteCode?: boolean
}

const InviteReceiverPage = ({ invalidInviteCode }: InviteReceiverPageProps) => {
  const router = useRouter()
  const { me, meLoading } = useMe()

  const hasMonthlySubscription =
    me?.activeMembership?.type?.name === 'MONTHLY_ABO'
  const hasYearlySubscription = me?.activeMembership?.type?.name === 'ABO'
  const isEligible = !hasYearlySubscription

  const inviteCode = Array.isArray(router.query?.code)
    ? router.query.code[0]
    : router.query?.code
  const inviteCodeHasUserSlug = inviteCode?.startsWith('~')

  const { data: senderProfileData } = useInviteSenderProfileQuery({
    variables: {
      accessToken: !inviteCodeHasUserSlug ? inviteCode : undefined,
      slug: inviteCodeHasUserSlug ? inviteCode.substring(1) : undefined,
    },
    skip: !inviteCode || meLoading,
  })

  // TODO: perhaps prevent indexing?
  // TODO: add correct meta tags
  const meta = {
    pageTitle: 'Werden Sie Teil der Republik',
    title: 'Werden Sie Teil der Republik',
    //description: 'baz',
    image: FUTURE_CAMPAIGN_SHARE_IMAGE_URL,
    url: `${PUBLIC_BASE_URL}${router.asPath}`,
  }
  // TODO: if user is logged in and has abo, show info text that the user already has an abo
  // TODO: if user has monthly abo, also show info text that not available if already subscirbed

  // TODO: if not logged in or probelesen show stepper
  const [price, setPrice] = useState<number>(240)

  const handleComplete = useCallback(() => {
    // TODO
    // based on the selected price either choose the
    // package that is associated with non coop membership.
    // else choose the package that is associated with coop membership
    // additionally attach ?utm_campaign received from the server based on the invite-code
    const res = confirm(`Weiter zum Checkout für ${price.toFixed()} CHF`)
    if (res) {
      router.push({
        pathname: '/angebote',
        query: {
          package: price >= 240 ? 'ABO' : 'MONTHLY_ABO',
          utm_campaign: 'TODO_5-jahre-republik',
        },
      })
    }
  }, [price])

  const steps: Step[] = [
    {
      name: STEPS.INTRO,
      content: (stepProps) => (
        <IntroductoryStep
          hasMonthlySubscription={hasMonthlySubscription}
          senderProfile={senderProfileData?.sender}
          {...stepProps}
        />
      ),
    },
    {
      name: STEPS.PRICE_SELECTOR,
      content: (stepProps) => (
        <SelectYourPriceStep
          {...stepProps}
          initialPrice={price}
          onSubmit={setPrice}
        />
      ),
    },
  ]

  return (
    <Frame containerMaxWidth={640} pageColorSchemeKey='dark' meta={meta}>
      {invalidInviteCode && <p>Invalid invite code</p>}
      {hasYearlySubscription && (
        <div {...styles.hasYearlySubscription}>
          <p>{t('FutureCampaign/receiver/yearlySubscription/1')}</p>
          <p>
            {t.elements('FutureCampaign/receiver/yearlySubscription/2', {
              cta: (
                <Link href='/verstaerkung-holen' passHref>
                  <a {...plainLinkRule}>
                    {t('FutureCampaign/receiver/yearlySubscription/cta')}
                  </a>
                </Link>
              ),
            })}
          </p>
        </div>
      )}
      {isEligible && (
        <Stepper
          steps={steps}
          onComplete={handleComplete}
          customStepperUIPlacement
          contentWrapperElement={({ children }) => (
            <div {...styles.wrapper}>{children}</div>
          )}
        />
      )}
    </Frame>
  )
}

export default InviteReceiverPage

const styles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minHeight: 850,
  }),
  hasYearlySubscription: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
    '& p': css({
      ...fontStyles.sansSerifRegular,
      margin: 0,
      fontSize: 17,
      lineHeight: '1.4em',
      [mediaQueries.mUp]: {
        fontSize: 21,
      },
    }),
    '& a': {
      textDecoration: 'underline',
    },
  }),
}
