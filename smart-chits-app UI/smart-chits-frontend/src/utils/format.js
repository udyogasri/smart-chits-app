export function formatCurrency(value, locale = 'en-IN', currency = 'INR') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function joinClassNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
