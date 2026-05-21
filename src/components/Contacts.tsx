"use client";

import { useState } from "react";

export default function Contacts() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contacts" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <p className="text-blue-600 text-sm font-medium tracking-widest uppercase mb-3">
              Контакты
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Обсудим ваш проект
            </h2>
            <p className="text-gray-600 leading-relaxed mb-10">
              Оставьте заявку и наш специалист свяжется с вами в течение одного рабочего дня.
            </p>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Телефон</div>
                <a href="tel:+78001234567" className="text-gray-800 hover:text-blue-600 transition-colors">
                  +7 (800) 123-45-67
                </a>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</div>
                <a href="mailto:info@kosmocapital.ru" className="text-gray-800 hover:text-blue-600 transition-colors">
                  info@kosmocapital.ru
                </a>
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Адрес</div>
                <span className="text-gray-800">г. Москва, ул. Примерная, 1</span>
              </div>
            </div>
          </div>

          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Заявка отправлена</h3>
                <p className="text-gray-500">Мы свяжемся с вами в течение рабочего дня.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1" htmlFor="name">Имя</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Ваше имя"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1" htmlFor="phone">Телефон</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+7 (___) ___-__-__"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1" htmlFor="message">Сообщение</label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Кратко опишите задачу"
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Отправить заявку
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
