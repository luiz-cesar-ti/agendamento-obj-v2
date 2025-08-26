import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Tv2, Hash } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

const getStatusStyles = (status: Booking['status']) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500/10 text-green-400 border border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30';
    case 'cancelled':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    case 'expired':
      return 'bg-gray-500/10 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-600/10 text-gray-300 border border-gray-500/30';
  }
};

const getBookingEquipmentDetails = (booking: Booking) => {
    if (!booking.equipment || booking.equipment.length === 0) {
        return { name: 'N/A', quantity: 0 };
    }
    const totalQuantity = booking.equipment.reduce((sum, item) => sum + item.quantity, 0);
    const primaryEquipmentName = booking.equipment[0].equipment_name;
    
    return {
        name: booking.equipment.length > 1 ? `${primaryEquipmentName} e outros` : primaryEquipmentName,
        quantity: totalQuantity
    };
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const { name: equipmentName, quantity } = getBookingEquipmentDetails(booking);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const statusTextMap: Record<Booking['status'], string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    expired: 'Encerrado'
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-form-bg border border-border-dark rounded-xl p-5 flex flex-col space-y-4"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-white">Agendamento de {booking.full_name}</h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusStyles(booking.status)}`}>
          {statusTextMap[booking.status]}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-text-secondary"><MapPin size={14} className="mr-2 text-white/50 flex-shrink-0" /><span className="font-medium mr-2 text-white/70">Local:</span> {booking.classroom}</div>
        <div className="flex items-center text-text-secondary"><Calendar size={14} className="mr-2 text-white/50 flex-shrink-0" /><span className="font-medium mr-2 text-white/70">Data:</span> {formatDate(booking.booking_date)}</div>
        <div className="flex items-center text-text-secondary"><Clock size={14} className="mr-2 text-white/50 flex-shrink-0" /><span className="font-medium mr-2 text-white/70">Horário:</span> {booking.start_time} - {booking.end_time}</div>
        <div className="flex items-center text-text-secondary"><Tv2 size={14} className="mr-2 text-white/50 flex-shrink-0" /><span className="font-medium mr-2 text-white/70">Equipamento:</span> {equipmentName}</div>
        <div className="flex items-center text-text-secondary"><Hash size={14} className="mr-2 text-white/50 flex-shrink-0" /><span className="font-medium mr-2 text-white/70">Quantidade Total:</span> {quantity}</div>
      </div>
    </motion.div>
  );
};

export const History: React.FC = () => {
  const { bookings, checkBookingExpiration, loading } = useApp();

  useEffect(() => {
    checkBookingExpiration();
    const interval = setInterval(() => checkBookingExpiration(), 60000);
    return () => clearInterval(interval);
  }, [checkBookingExpiration]);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Histórico de Agendamentos</h1>
        <p className="text-text-secondary text-lg mt-2">Visualize todos os agendamentos de equipamentos escolares</p>
      </header>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando histórico...</p>
        </div>
      ) : bookings.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20 bg-form-bg border border-dashed border-border-dark rounded-xl">
          <h3 className="text-xl font-medium text-white mb-2">Nenhum agendamento encontrado</h3>
          <p className="text-text-secondary">Ainda não há agendamentos registrados no sistema.</p>
        </div>
      )}
    </div>
  );
};
