import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface BlogContentProps {
  content: string
  className?: string
}

export function BlogContent({ content, className }: BlogContentProps) {
  return (
    <div className={`prose prose-lg max-w-none ${className || ''}`}>
      <ReactMarkdown
        components={{
          // Custom heading with anchor links
          h2: ({ children, ...props }) => (
            <h2 id={generateId(children)} className="scroll-mt-24" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 id={generateId(children)} className="scroll-mt-24" {...props}>
              {children}
            </h3>
          ),
          
          // Code blocks with syntax highlighting
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm`} {...props}>
                {children}
              </code>
            )
          },
          
          // Custom blockquote styling
          blockquote: ({ children, ...props }) => (
            <blockquote 
              className="border-l-4 border-primary pl-6 py-2 italic bg-muted/30 rounded-r-lg" 
              {...props}
            >
              {children}
            </blockquote>
          ),
          
          // Responsive images
          img: ({ alt, src, ...props }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-md max-w-full h-auto"
              loading="lazy"
              {...props}
            />
          ),
          
          // Custom table styling
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-border" {...props}>
                {children}
              </table>
            </div>
          ),
          
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
              {children}
            </th>
          ),
          
          td: ({ children, ...props }) => (
            <td className="border border-border px-4 py-2" {...props}>
              {children}
            </td>
          ),
          
          // Custom link styling
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-2"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              {...props}
            >
              {children}
            </a>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function generateId(children: any): string {
  const text = React.Children.toArray(children)
    .map(child => typeof child === 'string' ? child : '')
    .join('')
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}