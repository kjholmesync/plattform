import { ComponentDemo } from '@/theme/components/component-demo'
import { PropsTable } from '@/theme/components/props-table'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <strong>💅 Republik Styleguide</strong>,
  docsRepositoryBase: `https://github.com/republik/plattform/blob/${
    process.env.VERCEL_GIT_COMMIT_REF ?? 'main'
  }/docs/`,
  project: {
    link: 'https://github.com/republik/plattform',
  },
  primaryHue: 260,
  feedback: { content: null },
  footer: { text: null },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Republik Styleguide',
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
