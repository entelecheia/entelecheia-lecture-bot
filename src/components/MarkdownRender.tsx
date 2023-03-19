/* eslint-disable @typescript-eslint/no-explicit-any */
import 'katex/dist/katex.min.css'
import { ComponentProps, ReactNode, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import CopyButton from './CopyButton'

interface PreProps {
  className?: string
  children: ReactNode
}

function Pre({ className, children }: PreProps) {
  const preRef = useRef<HTMLPreElement>(null)
  return (
    <pre className={className} ref={preRef} style={{ position: 'relative' }}>
      <CopyButton
        className="code-copy-btn"
        contentFn={() => preRef.current?.textContent || ''}
        size={14}
      />
      {children}
    </pre>
  )
}

type MarkdownRenderProps = ComponentProps<typeof ReactMarkdown>

export function MarkdownRender(props: MarkdownRenderProps) {
  const linkProperties = {
    target: '_blank',
    style: { color: '#8ab4f8' },
    rel: 'nofollow noopener noreferrer',
  }
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[
        rehypeKatex,
        rehypeRaw,
        [
          rehypeHighlight,
          {
            detect: true,
            ignoreMissing: true,
          },
        ],
      ]}
      components={{
        a: (props: any) => (
          <a href={props.href} {...linkProperties}>
            {props.children}
          </a>
        ),
        pre: Pre,
      }}
      {...props}
    >
      {props.children}
    </ReactMarkdown>
  )
}

export default MarkdownRender
