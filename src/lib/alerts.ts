import Swal from 'sweetalert2'

const baseOptions = {
  confirmButtonColor: '#0f766e',
  cancelButtonColor: '#78716c',
  buttonsStyling: true,
}

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...baseOptions,
    icon: 'success',
    title,
    text,
  })
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    ...baseOptions,
    icon: 'error',
    title,
    text,
  })
}

export async function showConfirm(title: string, text: string, confirmButtonText = 'Ya, lanjut') {
  const result = await Swal.fire({
    ...baseOptions,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText: 'Batal',
  })

  return result.isConfirmed
}

export function showInfo(title: string, text?: string) {
  return Swal.fire({
    ...baseOptions,
    icon: 'info',
    title,
    text,
  })
}

export function showToast(
  icon: 'success' | 'error' | 'info' | 'warning',
  title: string,
) {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
    icon,
    title,
  })
}

export { Swal }
