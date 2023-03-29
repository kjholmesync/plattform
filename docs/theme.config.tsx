import { ComponentDemo } from '@/theme/components/component-demo'
import { PropsTable } from '@/theme/components/props-table'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Republik</span>,
  docsRepositoryBase: 'https://github.com/republik/plattform/blob/main/docs/',
  project: {
    link: 'https://github.com/republik/plattform',
  },
  feedback: { content: null },
  footer: { text: null },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Republik Docs',
      description: 'Hello',
    }
  },
  head: null,
  components: {
    ComponentDemo,
    PropsTable,
  },
}

export default config
