export function Spinner({ text = 'Cargando...' }: { text?: string }) {
  return <div className="p-6 text-sm text-gray-500">{text}</div>
}
