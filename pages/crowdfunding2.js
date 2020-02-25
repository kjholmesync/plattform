import React from 'react'
import md from 'markdown-in-js'
import Router, { withRouter } from 'next/router'
import { css } from 'glamor'
import { Link } from '../lib/routes'

import mdComponents from '../lib/utils/mdComponents'
import { thousandSeparator } from '../lib/utils/format'

import Employees from '../components/Imprint/Employees'
import Frame from '../components/Frame'
import VideoCover from '../components/VideoCover'
import ActionBar from '../components/ActionBar'
import List, { Highlight } from '../components/List'
import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'
import ContainerWithSidebar from '../components/Crowdfunding/ContainerWithSidebar'
import withSurviveStatus from '../components/Crowdfunding/withSurviveStatus'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import {
  Label,
  Button,
  Lead,
  colors,
  P,
  A,
  linkRule,
  Interaction,
  VideoPlayer
} from '@project-r/styleguide'

const styles = {
  mediaDiversity: css({
    margin: '20px 0',
    '& img': {
      width: 'calc(50% - 10px)',
      border: `1px solid ${colors.divider}`,
      margin: 5
    }
  }),
  stretchLead: css({
    margin: '20px 0 0'
  }),
  stretchP: css({
    fontSize: 17,
    lineHeight: '25px'
  })
}

export const VIDEOS = {
  main: {
    hls:
      'https://player.vimeo.com/external/213080233.m3u8?s=40bdb9917fa47b39119a9fe34b9d0fb13a10a92e',
    mp4:
      'https://player.vimeo.com/external/213080233.hd.mp4?s=ab84df0ac9134c86bb68bd9ea7ac6b9df0c35774&profile_id=175',
    subtitles: '/static/subtitles/main.vtt',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/main.jpg`
  }
}

export const Page = ({ router, crowdfunding }) => {
  const pledgeLink = (
    <Link route='pledge'>
      <a {...linkRule}>Jetzt mitmachen!</a>
    </Link>
  )

  const links = [
    {
      route: 'pledge',
      params: { package: 'ABO', userPrice: 1 },
      text: 'Sie können sich den Betrag nicht leisten?'
    },
    {
      href: `mailto:ir@republik.ch?subject=${encodeURIComponent(
        'Investitionsmöglichkeiten bei der Republik AG'
      )}`,
      text: 'Sie wollen investieren?'
    }
  ]
  const packages = [
    {
      name: 'MONTHLY_ABO',
      title: 'Monats-Abo',
      price: 2200
    },
    {
      name: 'ABO',
      title: 'Jahresmitgliedschaft',
      price: 24000
    },
    {
      name: 'BENEFACTOR',
      title: 'Gönner-Mitgliedschaft',
      price: 100000
    },
    {
      name: 'ABO_GIVE',
      title: 'Wachstum schenken',
      price: 24000
    },
    {
      name: 'DONATE',
      title: 'Spenden, sonst nichts'
    }
  ]

  return (
    <Frame
      raw
      meta={{
        pageTitle: 'Republik – das digitale Magazin von Project R',
        title: 'Republik – das digitale Magazin von Project R',
        description: 'Das war unser Crowdfunding.',
        image: `${CDN_FRONTEND_BASE_URL}/static/social-media/main.jpg`
      }}
      cover={<VideoCover src={VIDEOS.main} cursor endScroll={0.97} />}
    >
      <ContainerWithSidebar
        sidebarProps={{
          crowdfunding: {
            ...crowdfunding,
            status: crowdfunding.status && {
              memberships: crowdfunding.status.memberships,
              people: crowdfunding.status.people,
              money: crowdfunding.status.money
            }
          },
          links,
          packages,
          statusProps: {
            memberships: true
          }
        }}
      >
        <Lead>
          Unterstützen Sie unabhängigen Journalismus und leisten Sie sich ein
          Abonnement der Republik. Denn Sie haben guten Journalismus verdient.
        </Lead>
        {md(mdComponents)`

Die Republik gibt es seit 2018 und sie macht vieles anders. Zum Beispiel sind wir komplett unabhängig, werbefrei und kompromisslos in der Qualität. 

Unser Ziel: Journalismus, der die Köpfe klarer, das Handeln mutiger, die Entscheidungen klüger macht. Und der das Gemeinsame stärkt: die Freiheit, den Rechtsstaat, die Demokratie.

${pledgeLink}
  `}

        <div style={{ margin: '15px 0 0' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Teilen Sie diese Seite mit Ihren Freunden:
          </Label>
          <ActionBar
            url={PUBLIC_BASE_URL + router.pathname}
            emailSubject={'Es ist Zeit.'}
          />
        </div>

        <div {...styles.stretchLead}>
          <Interaction.P {...styles.stretchP} style={{ marginBottom: 10 }}>
            Damit das digitale Magazin Republik die Trendwende schafft müssen
            wir bis am 31.&nbsp;März noch 1{thousandSeparator}000 aktive
            Verlegerinnen und 500{thousandSeparator}000 Franken sammeln. Um
            beide Ziele zu erreichen wollen wir diesen Monat{' '}
            <Highlight>3000 Mitgliedschaften</Highlight> verkaufen. Denn eine
            möglichst grosse Verlegerschaft ist langfristig die beste Option.
          </Interaction.P>
          <Interaction.P {...styles.stretchP}>
            [Sobald erreicht] Dieses Ziel haben wir zusammen mit Ihnen am
            2.&nbsp;März erreicht. Herzlichen Dank! Republik will das
            Mediensystem entscheidend verändern – deshalb sammeln wir weiter!
          </Interaction.P>
          <List>
            <List.Item>
              <Highlight>Bei 6000</Highlight> verkauften Mitgliedschaften sind
              wir zum ersten Mal kurzfristig selbsttragend.
            </List.Item>
            <List.Item>
              <Highlight>Bei 9000</Highlight> sind wir für mindestens die
              nächsten zwei Jahre selbsttragend. Sofern wir die heutigen
              Erneuerungsraten halten können.
            </List.Item>
          </List>
        </div>

        {md(mdComponents)`
<br />

## Um was geht es jetzt?

Unabhängigkeit bedeutet auch: die Republik wird finanziert von den Leserinnen und Lesern. Nach gut zwei Jahren hat die Republik etwa 18’000 Abonnenten. 

Um mit den aktuellen Kosten eine schwarze Null zu schreiben, bräuchten wir konstant etwa 24’000 Mitglieder und Abonnenten. Wir sind überzeugt, dass wir das in den nächsten Jahren schaffen können. Weil wir sind jetzt schon weit gekommen:



1. Wir liefern täglich guten Journalismus: Die meisten unserer Abonnenten bleiben der Republik treu und viele haben diesen Winter ihre Mitgliedschaft schon zum zweiten Mal erneuert.

2. Mit investigativen Recherchen - zum Beispiel zum Bündner Baukartell oder zu den Arbeitsbedingungen bei der grössten Kita-Kette der Schweiz - haben wir nicht nur grosse mediale Debatten ausgelöst, sondern auch konkrete politische Reaktionen.

3. In einer offiziellen Untersuchung des Bundesamt für Kommunikation sind wir in den Kategorien “Glaubwürdigkeit” und “Kompetenz” schon im ersten Jahr auf Platz 13 (von 176 untersuchten Schweizer Medien). Bei der Sympathie sind wir sogar auf Platz 1 😊

Aber damit wir die Republik weiterführen und weiterentwickeln können, brauchen wir jetzt einen Wachstumsschub. Deshalb haben wir uns im Dezember ehrgeizige Ziele gesetzt: Bis Ende März mindestens 19’000 Mitglieder und Abonnenten sein und 2.2 Millionen Franken finden.

Den grösseren Teil des Geldes haben wir durch die Grosszügigkeit unserer Mitglieder und Investoren schon gefunden. 

Jetzt ist Endspurt und es geht darum, möglichst viele neue Leute von der Republik zu begeistern. 

Erreichen wir die Ziele nicht, beenden wir das Projekt, Sie bekommen Ihr Geld zurück und wir lösen das Unternehmen auf. 

Wenn Sie mitmachen und wir es schaffen, bekommen Sie nicht nur vernünftigen Journalismus, sondern haben auch einen entscheidenden Beitrag zur Medienvielfalt der Schweiz geleistet.

${pledgeLink}

## Aber was ist die Republik?

Im Kern ist die Republik eine Dienstleistung für interessierte Menschen in einer grossen, faszinierenden und komplexen Welt. Wir rennen, recherchieren und fragen. Und liefern Ihnen dann die Fakten und Zusammenhänge. Als Grundlagen für Ihre eigenen Überlegungen und Entscheidungen.

Das ist eine heikle Aufgabe. Denn Journalismus ist alles andere als harmlos: Es ist entscheidend, welche Geschichten erzählt werden. 

Deshalb haben wir von Anfang an die Stellschrauben so eingestellt, dass wir ihr Vertrauen gewinnen und diese Aufgabe bestmöglich erledigen können.

**Wir sind unabhängig. Und komplett werbefrei.** So können wir uns bei der Arbeit auf unseren einzigen Kunden konzentrieren: Sie. Und müssen weder möglichst viele Klicks generieren, noch Sie mit nervigen Anzeigen belästigen und geben auch Ihre persönlichen Daten nicht weiter.

**Wir sind das transparenteste Medienunternehmen (das wir kennen).** Wir legen alles offen: unsere Finanzen, Besitzverhältnisse, Motivation, Arbeitsweise, Fehler, Löhne – weil es wichtig ist, die Bedingungen zu kennen unter denen Information hergestellt wird. Denn Vertrauen ist die eigentlich harte Währung im Journalismus heute. 

**Wir sind mit Ihnen verbunden.** Und lieben es! Das Internet gibt uns nicht nur viel Freiheit, Inhalte auf verschiedene Arten zu erzählen, es ermöglicht vor allem, dass Sie mit uns in Dialog treten können. Und die Republik durch viele Stimmen vielfältiger, interessanter und reflektierter wird.

**Wir sind kompromisslos in der Qualität.** Unsere Reporter und Redaktorinnen haben Zeit, um einem Thema mit der angebrachten Sorgfalt und Hartnäckigkeit zu begegnen. Und es gibt drei Dinge, die wir besonders lieben: Gutes Deutsch. Gute Bilder. Und gutes Design.

**Ständige Weiterentwicklung ist in unserer DNA.** Wir sind so neugierig, wie wir es uns von unseren Leserinnen auch wünschen. Und damit wir uns in die richtige Richtung entwickeln, sind wir ständig im Dialog mit Ihnen.

## Und was bekommen ich für mein Abo?

Sie erhalten täglich eine bis drei neue Geschichten. Das Konzept:  Einordnung und Vertiefung anstelle einer Flut von Nachrichten. Unser Journalismus dreht sich in der Regel nicht um das Ereignis, sondern das System dahinter.

Sie lesen und hören in der Republik zu allem, was verworren, komplex -  und für viele wichtig ist. Zur Zeit beschäftigen uns Themen rund um Digitalisierung, Klima, Demokratie und Rechtsstaat besonders intensiv. 

Anstelle von täglichen News fassen wir für Sie in unseren Briefings die Woche im In- und Ausland zusammen, kompakt und übersichtlich - damit Sie nichts wichtiges verpassen.

Jede Woche finden Sie eine vielfältige Auswahl von Themen, Autoren und Formaten im Programm. 

Sie erhalten die Republik als wunderschöne App oder im Web. Und bei Bedarf schicken wir einen täglichen Newsletter. 

Und dann ist es an Ihnen, die Republik so zu nutzen, wie es für Sie stimmt: Sie lesen regelmässig oder unregelmässig, alles oder nur sehr ausgewählte Beiträge, bringen sich aktiv in Debatten ein oder geniessen einfach ab und zu einen Podcast. 

Sie haben die Möglichkeit, jeden Artikel mit Freunden zu teilen - auch wenn diese kein Abo haben. Die Artikel sind frei teilbar, weil wir Wirkung auf die politische Debatte wollen. 

Die Republik ist politisch nicht festgelegt, aber keineswegs neutral: Sie steht gegen die Diktatur der Angst. Und für die Werte der Aufklärung: für Klarheit im Stil, für Treue zu Fakten, für Lösungen von Fall zu Fall, für Offenheit gegenüber Kritik, für Respektlosigkeit vor der Macht und Respekt vor dem Menschen.

${pledgeLink}

## Wer arbeitet bei der Republik?

Unsere Redaktion besteht aus kompetenten Profis. Den besten, die wir finden konnten. Sehen Sie selbst und blättern Sie durch unsere Autorinnen und Redakteure.

`}

        <Employees
          ssr={false}
          withBoosted
          shuffle={15}
          slice={10}
          filter={e =>
            e.group !== 'Verwaltungsrat' && e.group !== 'Gründerinnenteam'
          }
        />

        {md(mdComponents)`

## Warum das alles wichtig ist

Bei der Republik und dem Journalismus im allgemeinen geht es nicht nur um den individuellen Nutzen. Es geht auch darum, eine wichtige Funktion in einer Demokratie ausüben: Den Mächtigen auf die Finger schauen, unabhängig zu recherchieren und Missstände aufzudecken.

Das Problem der traditionellen Medien ist, dass mit dem Internet ihr Geschäftsmodell zusammengebrochen ist. Sie verloren ihre Monopolstellung, die Abonnenten konnten nun fast alles gratis im Netz konsumieren. Die Bereitschaft für Journalismus zu bezahlen sank. Parallel dazu wanderten die Werbeeinnahmen zu Google, Facebook und co. ins Silicon Valley ab. 

Die Folgen davon sind unübersehbar. Abbau bei Redaktionen auf Kosten der Qualität und Vielfalt. Seit 2011 sind in der Schweiz unter dem Strich mehr als 3000 Stellen im Journalismus verschwunden. (Das ist viel: damit könnte man 100 Republiken machen.) 

Zeitungen fusionieren, Redaktionen werden zusammengelegt, es gibt immer weniger Player auf dem Medienmarkt. Im Deutschschweizer Zeitungsbusiness haben Tamedia, Ringier und die NZZ jetzt schon zusammen über 80% Marktanteil. 

Und als neueste Entwicklung: um den sinkenden Werbeeinnahmen entgegenzuwirken gehen die Verlage immer dreistere Deals mit Werbekunden ein und die Grenze zwischen redaktionellen Beiträgen und Werbung verwischt. Der Presserat sah sich letztes Jahr zu einem Leiturteil gezwungen, um die Grenzüberschreitungen der Verlage zu verurteilen. 

Kurz: es steht es nicht unbedingt gut um die Branche und die Zukunft des Journalismus.

Als Antwort auf diese Entwicklungen - und aus Liebe zu gutem Journalismus - sind wir die Republik am aufbauen.

Einerseits als konkreten Beitrag zur Vielfalt. Andererseits ist die Republik auch ein Experiment für einen Journalismus, der Unabhängigkeit konsequent ernst nimmt. Dazu müssen wir ein passendes Geschäftsmodell entwickeln, das intakte Chancen auf eine Zukunft hat. (Und dann hoffentlich von vielen Journalisten und Unternehmerinnen kopiert wird!)

Eine Republik baut niemand alleine, sondern nur viele gemeinsam. Wir mit Ihnen?

  `}
        <br />
        <Link route='pledge' passHref>
          <Button primary style={{ minWidth: 300 }}>
            Jetzt mitmachen!
          </Button>
        </Link>

        <div style={{ margin: '15px 0 40px' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Jetzt andere auf die Republik aufmerksam machen:
          </Label>
          <ActionBar
            url={PUBLIC_BASE_URL + router.pathname}
            emailSubject={'Es ist Zeit.'}
          />
        </div>

        {md(mdComponents)`

Noch nicht überzeugt? Wir haben zusammen mit unseren Komplizen 101 Gründe gesammelt, warum es sich lohnt, Mitglied der Republik zu werden.

Und danach ist es wirklich Zeit für eine Entscheidung. 

TK: 101-Gründe-Link

## 19'566 Verlegerinnen und Verleger

  `}
        {crowdfunding && (
          <div style={{ margin: '20px 0' }}>
            <TestimonialList
              first={10}
              membershipAfter={crowdfunding.endDate}
              onSelect={id => {
                Router.push(`/community?id=${id}`).then(() => {
                  window.scrollTo(0, 0)
                })
                return false
              }}
            />
          </div>
        )}

        <Link route='community'>
          <a {...linkRule}>Alle ansehen</a>
        </Link>

        <br />
        <br />
        <br />
      </ContainerWithSidebar>
    </Frame>
  )
}

export default withSurviveStatus(withRouter(Page))
