import { TypewriterContent } from '@app/app/(campaign)/components/typewriter-content'
import { ELIGIBLE_RECEIVER_MEMBERSHIPS } from '@app/app/(campaign)/config'
import { UserInviterProfileInfoDocument } from '@app/graphql/republik-api/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { css } from '@app/styled-system/css'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const SenderProfile = ({
  portrait,
  text,
}: {
  portrait?: string
  text: string
}) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'row',
        gap: '4',
        alignItems: 'center',
        // background: 'overlay',
        // color: 'pageBackground',
        p: '2',
        pr: '4',
        borderRadius: '5px',
        maxW: 400,
      })}
    >
      {portrait && (
        <div
          style={{
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <Image
            className={css({
              borderRadius: '4px',
              // borderWidth: '2px',
              // borderColor: 'primary',
              // borderStyle: 'solid',
              boxShadow: 'sm',
              width: { base: '4.5rem', md: '6rem' },
              height: { base: '4.5rem', md: '6rem' },
            })}
            alt='Portrait'
            src={portrait}
            width={96}
            height={96}
            unoptimized
          />
        </div>
      )}
      <div
        className={css({
          flex: '0 1 auto',
          textStyle: 'sansSerifMedium',
          fontSize: 'xl',
        })}
      >
        <p>{text}</p>
      </div>
    </div>
  )
}

const CTA = ({ href }: { href: string }) => {
  return (
    <div
      className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2',
        position: 'sticky',
        bottom: '0',
        pb: '4',
        pt: '16',
        backgroundGradient: 'stickyBottomPanelBackground',
        width: 'full',
      })}
    >
      <Link
        className={css({
          background: 'contrast',
          color: 'text.inverted',
          px: '6',
          py: '3',
          borderRadius: '3px',
          fontWeight: 'medium',
          cursor: 'pointer',
          textDecoration: 'none',
          textAlign: 'center',
          display: 'block',
          // width: 'full',
          _hover: {},
        })}
        href={href}
      >
        Wählen Sie Ihren Einstiegspreis
      </Link>
      <p className={css({ fontSize: 'base' })}> ab CHF 120 für ein Jahr</p>
    </div>
  )
}

export default async function Page({ params }) {
  const { data } = await getClient().query({
    query: UserInviterProfileInfoDocument,
    variables: { accessToken: params.code },
  })

  const { sender } = data

  const isEligible = !ELIGIBLE_RECEIVER_MEMBERSHIPS.includes(
    data.me?.activeMembership.type.name,
  )

  if (!isEligible) {
    return redirect('/campaign-sender')
  }

  // if (!sender) {
  //   return <div>code hat nicht gefunzt</div>
  // }

  if (sender && data.me && sender?.id === data.me?.id) {
    return redirect('/campaign-sender')
  }

  return (
    <>
      <h1
        className={css({
          textStyle: 'campaignHeading',
          mt: '8-16',
          pr: '16',
        })}
      >
        <TypewriterContent />
      </h1>
      <div
        className={css({
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8',
        })}
      >
        {sender ? (
          <div>
            <SenderProfile
              portrait={sender.portrait}
              text={`${sender.firstName} ${sender.lastName} hat Sie eingeladen, die Republik zu unterstützen.`}
            />
          </div>
        ) : (
          <p>Machen Sie mit bei der Republik, denn das ist super cool!</p>
        )}

        {/* <p>
          Die Republik ist ein unabhängiges, Leserinnen finanziertes
          Onlinemagazin.
        </p>
        <p>
          Mit Ihrer Unterstützung decken wir staatliche Überwachung auf, ordnen
          das aktuelle Geschehen ein, fragen nach und führen den höflichsten
          Debattenraum der Schweiz – und vieles mehr.
        </p> */}

        <p>
          Die Republik ist ein digitales Magazin für Politik, Wirtschaft,
          Gesellschaft und Kultur. Unabhängig und werbefrei – finanziert von
          seinen Leserinnen und Lesern.
        </p>
        <p>
          In der Republik erwarten Sie von Montag bis Samstag Beiträge zum Lesen
          und Hören - von professionellen Sprecherinnen vorgelesen. Wir nehmen
          uns die nötige Zeit, um aktuelle Themen und Fragen für Sie angemessen
          und sorgfältig zu recherchieren, zu erzählen – und alle Fakten zu
          überprüfen.
        </p>
        <p>
          Damit Sie einen klaren Kopf behalten, mutig handeln und klug
          entscheiden können.
        </p>
        <CTA href={`${params.code}/angebot`} />

        {/* <CTA href={`${params.code}/angebot`} /> */}
      </div>
    </>
  )
}
