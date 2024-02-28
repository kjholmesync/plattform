import { getSenderData } from '@app/app/(campaign)/campaign-data'
import { CampaignLogo } from '@app/app/(campaign)/components/campaign-logo'
import { CampaignProgress } from '@app/app/(campaign)/components/campaign-progress'
import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import {
  ShareImageConfigurator,
  ShareLink,
} from '@app/app/(campaign)/jetzt-einladen/share-components'
import Container from '@app/components/container'
import { css } from '@app/styled-system/css'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CAMPAIGN_META_ARTICLE_URL,
  CAMPAIGN_REFERRALS_GOAL,
} from '../constants'
import { Success } from '@app/app/(campaign)/jetzt-einladen/success'

export default async function Page() {
  const { me } = await getSenderData()

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/jetzt/${
    me?.hasPublicProfile ? me.username : me?.referralCode
  }`

  if (!me) {
    return redirect('/anmelden')
  }

  const referred = me.referrals?.count || 0

  const aboType = me.activeMembership?.type.name
  const hasMonthlyAbo = aboType === 'MONTHLY_ABO'
  const hasRegularAbo = ['ABO', 'BENEFACTOR_ABO'].includes(aboType)

  return (
    <Container>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '8',
          py: '8-16',
          fontSize: 'xl',
        })}
      >
        <CampaignLogo
          className={css({
            width: { base: '120px', md: '240px' },

            maxWidth: 'full',
            height: 'auto',
            mx: 'auto',
          })}
        />
        <h1
          className={css({
            textStyle: 'campaignHeading',
            display: 'flex',
            alignItems: 'center',
            gap: '8',
          })}
        >
          <TypewriterContent />
        </h1>

        <Success
          referred={referred}
          hasMonthlyAbo={hasMonthlyAbo}
          hasRegularAbo={hasRegularAbo}
        />

        <p>
          Lassen Sie uns diese Verantwortung auf mehr Schultern verteilen:{' '}
          <Link href={CAMPAIGN_META_ARTICLE_URL}>
            Bis zum 31. März suchen wir {CAMPAIGN_REFERRALS_GOAL} zusätzliche
            Verlegerinnen
          </Link>
          . Denn je mehr Menschen sich einsetzen, desto breiter ist die
          Grundlage für das, weshalb wir alle hier sind: unabhängiger
          Journalismus.
        </p>

        <p>Aktueller Zwischenstand:</p>

        <div>
          <CampaignProgress />
        </div>

        <h2 className={css({ textStyle: 'campaignHeading' })}>
          Helfen Sie mit!
        </h2>

        <p>
          Teilen Sie Ihren Kampagnen-Link. Über diesen erhalten die
          Empfängerinnen ein zeitlich limitiertes Einstiegsangebot: ein Jahr
          Republik ab CHF 120. Wenn das erste Mal jemand über Ihren Link ein
          neues Abo abschliesst,{' '}
          {hasRegularAbo && <>verlängern wir Ihr eigenes um einen Monat.</>}
          {hasMonthlyAbo && (
            <>
              schreiben wir Ihnen auf einen schreiben wir Ihnen auf einen
              zukünftigen Republik-Monat CHF 20 gut.
            </>
          )}
        </p>

        <ShareLink url={url} />

        <p>
          Ein Link ist Ihnen zu unpersönlich? Dann teilen Sie Ihr
          Kampagnen-Bild.
        </p>

        <ShareImageConfigurator
          url={url}
          userHasPublicProfile={me?.hasPublicProfile}
        />
      </div>
    </Container>
  )
}
