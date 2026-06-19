import { useToast as useToastHook } from '../components/Toast'

/**
 * Custom hook to show toast notifications
 * @returns {Object} Toast utilities with showToast method
 * 
 * Usage:
 *   const { toast } = useToast()
 *   toast('Payment successful!', 'success')
 *   toast('Error occurred', 'error')
 */
export function useToast() {
  const { showToast } = useToastHook()

  return {
    toast: showToast,
  }
}
