export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-gray-400 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <span className="font-semibold text-white">
          Космо<span className="text-blue-400">капитал</span>
        </span>
        <span>© {year} Космокапитал. Все права защищены.</span>
        <div className="flex gap-6">
          <a href="#about" className="hover:text-white transition-colors">О компании</a>
          <a href="#services" className="hover:text-white transition-colors">Услуги</a>
          <a href="#contacts" className="hover:text-white transition-colors">Контакты</a>
        </div>
      </div>
    </footer>
  );
}
