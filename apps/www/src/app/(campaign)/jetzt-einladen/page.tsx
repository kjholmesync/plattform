import { getSenderData } from '@app/app/(campaign)/campaign-data'
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
import { CAMPAIGN_REFERRALS_GOAL } from '../constants'

export default async function Page() {
  const data = await getSenderData()

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/jetzt/${
    data.me?.hasPublicProfile ? data.me.username : data.me?.referralCode
  }`

  if (!data.me) {
    return redirect('/anmelden')
  }

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
        {/* <p>
          {' '}
          <strong>
            Nice! Sie haben schon {data.me?.futureCampaignAboCount} Leute
            eingeladen 🎉
          </strong>
        </p> */}

        <h1 className={css({ textStyle: 'campaignHeading' })}>
          <TypewriterContent />
        </h1>

        <p>
          Lassen Sie uns diese Verantwortung auf mehrere Schultern verteilen:{' '}
          <Link href='#'>
            Bis zum 31. März suchen wir {CAMPAIGN_REFERRALS_GOAL} neue
            Unterstützer
          </Link>
          . Je mehr Menschen sich einsetzen, umso grösser ist die Grundlage für
          das, weshalb wir alle hier sind: Unabhängiger Journalismus.
        </p>

        <p>Der aktuelle Zwischenstand:</p>

        <div>
          <CampaignProgress />
        </div>

        <h2 className={css({ textStyle: 'campaignHeading' })}>
          Helfen Sie mit!
        </h2>

        <p>
          Teilen Sie Ihren Kampagnen-Link und erzählen Sie Ihren Bekannten,
          warum Sie die Republik unterstützen. Wir bieten Neugierigen,
          Interessierten und Unentschlossenen ein spezielles Einstiegsangebot.
          Und wenn jemand über Ihren Link ein neues Abo abschliesst, verlängern
          wir Ihr eigenes um einen Monat.
        </p>

        <ShareLink url={url} />

        <p>
          Ein Link ist Ihnen zu unpersönlich? Dann teilen Sie Ihr Kampagnen-Bild
          auf Social Media.
        </p>

        <ShareImageConfigurator
          url={url}
          userHasPublicProfile={data.me?.hasPublicProfile}
        />
      </div>
    </Container>
  )
}
