import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import styles from './component-demo.module.css'

const ErrorFallback = () => (
  <div style={{ background: 'hotpink', color: 'white' }}>
    Oh ho! Something happened here.
  </div>
)

export const ComponentDemo = ({
  file,
  Component,
  children,
}: {
  file: string
  Component: () => JSX.Element
  children: ReactNode
}) => (
  <div data-file={file}>
    <div className={styles.demoArea}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Component />
      </ErrorBoundary>
    </div>

    {children}
  </div>
)
