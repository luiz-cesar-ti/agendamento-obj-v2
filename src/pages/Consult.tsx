import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, Package, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

export const Consult: React.FC = () => {
  const { getBookingsByDate, showNotification } = useApp();
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleDateSearch = async () => {
    if (!selectedDate) {
      showNotification('Por favor, selecione uma data para consultar.', 'info');
      return;
    }

    setLoading(true);
    try {
      const dateBookings = await getBookingsByDate(selectedDate);
      setBookings(dateBookings);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      showNotification('Erro ao buscar agendamentos. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    // Adiciona o deslocamento de fuso horário para garantir que a data não mude
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-form-bg rounded-lg shadow-lg overflow-hidden border border-border-dark">
        <div className="bg-gradient-to-r from-blue-900 via-slate-800 to-form-bg px-6 py-4 border-b border-border-dark">
          <h1 className="text-2xl font-bold text-white">Consultar Reservas por Data</h1>
          <p className="text-blue-200 mt-1">Selecione uma data para visualizar todas as reservas do dia</p>
        </div>

        <div className="p-6">
          {/* Date Selection */}
          <div className="bg-input-bg p-4 rounded-lg mb-6 border border-border-dark">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  <Calendar className="inline-block w-4 h-4 mr-2" />
                  Selecione a Data
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 bg-form-bg border border-border-dark rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-white"
                />
              </div>
              <button
                onClick={handleDateSearch}
                disabled={loading}
                className="px-6 py-2 bg-btn-bg text-white rounded-lg font-medium hover:bg-btn-bg-hover disabled:opacity-50 flex items-center justify-center w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Consultar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {hasSearched && (
            <div>
              {selectedDate && (
                <h2 className="text-xl font-bold text-white mb-4">
                  Reservas para {formatDate(selectedDate)}
                </h2>
              )}

              {bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative p-6 rounded-lg border-2 transition-all ${
                        booking.status === 'expired'
                          ? 'bg-red-900/20 border-red-700'
                          : 'bg-input-bg border-border-dark'
                      }`}
                    >
                      {booking.status === 'expired' && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          ENCERRADO
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center text-text-secondary">
                            <User className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="font-medium text-white">Nome:</span>
                            <span className="ml-2">{booking.full_name}</span>
                          </div>

                          <div className="flex items-center text-text-secondary">
                            <MapPin className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="font-medium text-white">Sala/Turma:</span>
                            <span className="ml-2">{booking.classroom}</span>
                          </div>

                          <div className="flex items-center text-text-secondary">
                            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="font-medium text-white">Data:</span>
                            <span className="ml-2">{formatDate(booking.booking_date)}</span>
                          </div>

                          <div className="flex items-center text-text-secondary">
                            <Clock className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="font-medium text-white">Horário:</span>
                            <span className="ml-2">
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center text-text-secondary mb-3">
                            <Package className="w-4 h-4 mr-2 text-blue-400" />
                            <span className="font-medium text-white">Equipamentos:</span>
                          </div>
                          <div className="space-y-2">
                            {booking.equipment?.map((item, index) => (
                              <div
                                key={index}
                                className="bg-form-bg px-3 py-2 rounded text-sm border border-border-dark"
                              >
                                <span className="font-medium text-white">{item.equipment_name}</span>
                                <span className="text-text-secondary ml-2">
                                  (Quantidade: {item.quantity})
                                </span>
                              </div>
                            )) || (
                              <div className="text-text-secondary text-sm">Nenhum equipamento</div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border-dark">
                        <p className="text-xs text-text-secondary">
                          Reserva criada em: {new Date(booking.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Nenhuma reserva encontrada
                  </h3>
                  <p className="text-text-secondary">
                    Não há reservas para a data selecionada.
                  </p>
                </div>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Selecione uma data para consultar
              </h3>
              <p className="text-text-secondary">
                Use o campo de data acima para buscar reservas de um dia específico.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
