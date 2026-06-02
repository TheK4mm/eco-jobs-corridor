export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Corredor Ecológico · Villavicencio – Meta</p>
        <p className="mt-1 text-xs">
          Plataforma de empleo para los habitantes del Corredor Ecológico.
        </p>
      </div>
    </footer>
  );
}
