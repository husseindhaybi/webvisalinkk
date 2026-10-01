import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { EXPO_OUT, IN_VIEW } from '../lib/motion'

// Heading whose words rise out of their own masks as it scrolls into view.
// Words, never letters: splitting Arabic letters would break their joining.
export function RevealWords({ text, as: Tag = 'h2', className, delay = 0, id }) {
  const ref = useRef(null)
  const inView = useInView(ref, IN_VIEW)
  const words = text.split(' ')
  return (
    <Tag ref={ref} className={className} id={id}>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${word}-${i}`}>
            <span className="mask">
              <motion.span
                className="mask-inner"
                initial={{ y: '110%', filter: 'blur(8px)' }}
                animate={inView ? { y: '0%', filter: 'blur(0px)' } : { y: '110%', filter: 'blur(8px)' }}
                transition={{ duration: 1, ease: EXPO_OUT, delay: delay + i * 0.05 }}
              >
                {word}
              </motion.span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}

// Fades and lifts a block the first time it comes into view.
export function FadeUp({ as = 'div', children, delay = 0, y = 18, className, ...rest }) {
  const ref = useRef(null)
  const inView = useInView(ref, IN_VIEW)
  const Component = motion[as]
  return (
    <Component
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.9, ease: EXPO_OUT, delay }}
      {...rest}
    >
      {children}
    </Component>
  )
}
