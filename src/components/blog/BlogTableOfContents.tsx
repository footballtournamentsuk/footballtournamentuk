import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { generateTableOfContents } from '@/utils/blogUtils'

interface BlogTableOfContentsProps {
  content: string
  className?: string
}

export function BlogTableOfContents({ content, className }: BlogTableOfContentsProps) {
  const [toc, setToc] = useState<Array<{ id: string; title: string; level: number }>>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const tocItems = generateTableOfContents(content)
    setToc(tocItems)
    
    // Default to open on desktop
    setIsOpen(window.innerWidth >= 768)
  }, [content])

  useEffect(() => {
    if (toc.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.sort((a, b) => 
            a.boundingClientRect.top - b.boundingClientRect.top
          )[0]
          setActiveId(topEntry.target.id)
        }
      },
      {
        rootMargin: '-20% 0% -80% 0%',
        threshold: 0
      }
    )

    // Observe all heading elements
    toc.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [toc])

  if (toc.length === 0) return null

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <Card className={`sticky top-24 ${className || ''}`}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center justify-between w-full p-0 h-auto"
            >
              <CardTitle className="text-base">Table of Contents</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <nav className="space-y-1">
              {toc.map(({ id, title, level }) => (
                <button
                  key={id}
                  onClick={() => scrollToHeading(id)}
                  className={`
                    block w-full text-left text-sm transition-colors hover:text-primary
                    ${level === 2 ? 'pl-0' : 'pl-4'}
                    ${activeId === id ? 'text-primary font-medium' : 'text-muted-foreground'}
                  `}
                >
                  {title}
                </button>
              ))}
            </nav>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}