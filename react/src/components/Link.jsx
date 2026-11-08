import { navigateTo } from '../navigation.js'

export default function Link({ href = '/', children, className = '', onClick, ...props }) {
  function handleClick(event) {
    onClick?.(event)

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return

    event.preventDefault()
    navigateTo(href)
  }

  return <a href={href} className={className} onClick={handleClick} {...props}>{children}</a>
}
