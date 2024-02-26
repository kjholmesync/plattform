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
import { CAMPAIGN_REFERRALS_GOAL } from '../constants'

export default async function Page() {
  const { me } = await getSenderData()

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/jetzt/${
    me?.hasPublicProfile ? me.username : me?.referralCode
  }`

  if (!me) {
    return redirect('/anmelden')
  }

  const hasMonthlyAbo = me?.activeMembership?.type.name === 'MONTHLY_ABO'
  const hasRegularAbo = ['ABO', 'BENEFACTOR_ABO'].includes(
    me?.activeMembership?.type.name,
  )

  const referred = me.referrals?.count || 0

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

        {referred > 0 && (
          <div
            data-theme-inverted
            className={css({
              borderRadius: '4px',
              background: 'text',
              color: 'pageBackground',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              px: '8',
              py: '6',
              gap: '6',
              alignSelf: 'stretch',
              '& a': { color: 'pageBackground' },
            })}
          >
            {/* <div
              className={css({
                fontSize: '36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              })}
            >
              🎉
            </div> */}
            <div>
              <p>
                {referred === 1 && (
                  <>
                    Herzlichen Dank! Über Ihren persönlichen Link hat jemand ein
                    Abo abgeschlossen.
                    {hasRegularAbo && (
                      <> Zum Dank schenken wir Ihnen einen Monat Republik.</>
                    )}
                    {hasMonthlyAbo && (
                      <>
                        {' '}
                        Zum Dank schreiben wir Ihnen CHF 20 auf einen künftigen
                        Republik-Monat gut.
                      </>
                    )}
                  </>
                )}
                {referred == 2 && (
                  <>
                    Wahnsinn! Schon <strong>zwei Personen</strong> haben über
                    Ihren Link den Weg zur Republik gefunden und ein Abo
                    abgeschlossen. Finden Sie noch eine dritte?
                  </>
                )}
                {referred > 2 && (
                  <>
                    Grossartig! <strong>{referred} Personen</strong> haben über
                    Ihren Link ein Republik-Abo abgeschlossen. Sie haben
                    offensichtlich Talent.{' '}
                    <Link href='#TODO'>Teilen Sie Ihre Tipps mit uns!</Link>
                    {/*TODO: (Link zum Meta-Beitrag mit
                    Dialog)*/}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        <p>
          Lassen Sie uns diese Verantwortung auf mehr Schultern verteilen:{' '}
          <Link href='#'>
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
