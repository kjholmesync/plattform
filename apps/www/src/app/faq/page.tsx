import { FaqDocument } from '@graphql/cms/gql/graphql'
import { getCMSClient } from '@app/lib/apollo/cms-client'
import Container from '@app/components/container'
import { PageLayout } from '@app/components/layout'
import { css } from '@app/styled-system/css'
import FAQList from './components/faq-list'

export default async function FAQPage() {
  const client = getCMSClient()
  const res = await client.query({ query: FaqDocument })
  return (
    <div>
      <PageLayout>
        <div
          className={css({
            color: 'text',
            pb: '16-32',
            pt: '4',
          })}
        >
          <Container>
            <FAQList
              entries={res.data.faq.entries}
              title={res.data.faq.title}
              introduction={res.data.faq.introduction}
            />
          </Container>
        </div>
      </PageLayout>
    </div>
  )
}
