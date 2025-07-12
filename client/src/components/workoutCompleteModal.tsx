import { TransitionChild, Dialog, DialogPanel, DialogTitle, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const WorkoutCompleteModal = ({
  isOpen,
  totalSeconds,
  onSave,
  onClose
}: {
  isOpen: boolean
  totalSeconds: number
  onSave: () => void
  onClose: () => void
}) => {
  const format = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min} min ${sec} sec`
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="bg-white max-w-md w-full p-6 rounded-lg text-center shadow-xl">
            <DialogTitle className="text-2xl font-bold text-green-600 mb-4">
              Complimenti!
            </DialogTitle>
            <p className="text-gray-700 mb-2">
              Hai completato il tuo allenamento.
            </p>
            <p className="text-gray-700 mb-6 font-semibold">
              Tempo totale: {format(totalSeconds)}
            </p>
            <button
              onClick={onSave}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 mb-2 w-full"
            >
              Salva allenamento a calendario
            </button>
            <button
              onClick={onClose}
              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm mt-2"
            >
              Torna alla dashboard
            </button>
          </DialogPanel>
        </div>
      </Dialog>
    </Transition>
  )
}

export default WorkoutCompleteModal