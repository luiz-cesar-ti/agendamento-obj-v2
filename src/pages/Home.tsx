import React from 'react';
import { BookingForm } from '../components/BookingForm';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <header className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold">Sistema de Agendamento de Equipamentos</h1>
        <p className="text-text-secondary text-lg mt-2">Agende notebooks, tablets, microfones e caixas de som para suas aulas</p>
      </header>
      <main className="w-full">
        <BookingForm />
      </main>
    </div>
  );
};
