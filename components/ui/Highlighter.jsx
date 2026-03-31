"use client"

import { useLayoutEffect, useRef } from "react"
import { useInView } from "motion/react"
import { annotate } from "rough-notation"

export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  delay = 0,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = true,
  className = "",
}) {
  const elementRef = useRef(null)

  const isInView = useInView(elementRef, {
    once: true,
    margin: "-10%",
  })

  // If isView is false, always show. If isView is true, wait for inView
  const shouldShow = !isView || isInView

  useLayoutEffect(() => {
    const element = elementRef.current
    let annotation = null
    let resizeObserver = null
    let timeoutId = null

    if (shouldShow && element) {
      const showAnnotation = () => {
        const annotationConfig = {
          type: action,
          color,
          strokeWidth,
          animationDuration,
          iterations,
          padding,
          multiline,
        }

        const currentAnnotation = annotate(element, annotationConfig)
        annotation = currentAnnotation
        currentAnnotation.show()

        resizeObserver = new ResizeObserver(() => {
          currentAnnotation.hide()
          currentAnnotation.show()
        })

        resizeObserver.observe(element)
        resizeObserver.observe(document.body)
      }

      if (delay > 0) {
        timeoutId = setTimeout(showAnnotation, delay)
      } else {
        showAnnotation()
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      annotation?.remove()
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
    }
  }, [
    shouldShow,
    action,
    color,
    strokeWidth,
    animationDuration,
    delay,
    iterations,
    padding,
    multiline,
  ])

  return (
    <span ref={elementRef} className={`relative inline-block bg-transparent ${className}`}>
      {children}
    </span>
  )
}
