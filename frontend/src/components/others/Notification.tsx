import { Toaster, toast } from 'react-hot-toast';

export const showConfirmDialog = async (message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    toast.custom((t) => (
      <div className={`bg-white p-4 rounded-lg shadow-xl border ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
        <p className="text-amber-900 font-medium">{message}</p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
            className="px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700"
          >
            Aceptar
          </button>
        </div>
      </div>
    ), {
      duration: Infinity, // El toast no se cierra automáticamente
      position: 'top-center'
    });
  });
};

export default function Notification() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        className: 'font-serif',
        style: {
          background: '#f5e7d0',
          color: '#92400e',
          border: '1px solid #f5e7d2',
          padding: '1rem',
        },
        success: {
          duration: 2000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#f5e7d0',
          },
        },
        error: {
          duration: 3000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#f5e7d0',
          },
        },
      }}
    />
  );
}