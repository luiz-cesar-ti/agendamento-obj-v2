import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, LogOut, BarChart3, TrendingUp, RefreshCw, Mail, Key, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Equipment, Booking, BookingEquipment, AdminSettings } from '../types';
import { supabase } from '../lib/supabase';
import { EquipmentStatus } from '../components/EquipmentStatus';

export const Admin: React.FC = () => {
  const {
    session,
    equipment,
    equipmentUsage,
    bookings,
    dashboardStats,
    helpContent,
    loading,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    updateBooking,
    deleteBooking,
    refreshData,
    getAvailableEquipment,
    updateHelpContent,
    showNotification
  } = useApp();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'equipment' | 'bookings' | 'help'>('dashboard');
  
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [newEquipmentData, setNewEquipmentData] = useState<Partial<Equipment>>({ name: '', total_quantity: 0, category: '' });

  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingBookingEquipment, setEditingBookingEquipment] = useState<Omit<BookingEquipment, 'id' | 'booking_id'>[]>([]);
  const [availabilityErrors, setAvailabilityErrors] = useState<Record<string, string>>({});

  const [helpSettings, setHelpSettings] = useState<Partial<AdminSettings>>({ help_text: '', help_video_url: '' });

  useEffect(() => {
    if (helpContent) {
      setHelpSettings({
        help_text: helpContent.help_text || '',
        help_video_url: helpContent.help_video_url || ''
      });
    }
  }, [helpContent]);

  const statusTextMap: Record<Booking['status'], string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    cancelled: 'Cancelado',
    expired: 'Encerrado'
  };

  const getStatusStyles = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/50 text-green-400 border-green-700';
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-700';
      case 'cancelled':
        return 'bg-red-900/50 text-red-400 border-red-700';
      case 'expired':
        return 'bg-gray-700/50 text-gray-400 border-gray-600';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session, refreshData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.password,
    });

    if (error) {
      showNotification('Credenciais inválidas!', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentData.name || !newEquipmentData.category) return;
    await addEquipment(newEquipmentData as Omit<Equipment, 'id'>);
    setNewEquipmentData({ name: '', total_quantity: 0, category: '' });
  };

  const handleUpdateEquipment = async () => {
    if (editingEquipment) {
      await updateEquipment(editingEquipment);
      setEditingEquipment(null);
    }
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('Tem certeza que deseja remover este equipamento?')) {
      deleteEquipment(id);
    }
  };

  const startEditingBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditingBookingEquipment(booking.equipment?.map(e => ({ equipment_id: e.equipment_id, equipment_name: e.equipment_name, quantity: e.quantity })) || []);
  };

  const handleUpdateBookingEquipment = async (equipmentId: string, newQuantity: number) => {
    if (!editingBooking) return;

    const availableData = await getAvailableEquipment(editingBooking.booking_date, editingBooking.start_time, editingBooking.end_time, editingBooking.id);
    const targetEquipment = availableData.find(e => e.id === equipmentId);
    const availableQuantity = targetEquipment?.total_quantity || 0;

    if (newQuantity > availableQuantity) {
      setAvailabilityErrors(prev => ({ ...prev, [equipmentId]: `Disponível apenas ${availableQuantity} unidades.` }));
      return;
    }
    
    setAvailabilityErrors(prev => ({ ...prev, [equipmentId]: '' }));
    setEditingBookingEquipment(prev => prev.map(e => e.equipment_id === equipmentId ? { ...e, quantity: newQuantity } : e));
  };

  const handleSaveBookingUpdate = async () => {
    if (!editingBooking || Object.values(availabilityErrors).some(e => e)) return;
    await updateBooking(
      editingBooking.id,
      { status: editingBooking.status },
      editingBookingEquipment.filter(e => e.quantity > 0)
    );
    setEditingBooking(null);
    setEditingBookingEquipment([]);
    setAvailabilityErrors({});
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm('Tem certeza que deseja remover este agendamento?')) {
      deleteBooking(id);
    }
  };

  const handleSaveHelpSettings = async () => {
    await updateHelpContent(helpSettings);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 -m-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acesso Administrativo</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Mail className="w-4 h-4 mr-2" />Email</label>
              <input type="email" value={loginData.email} onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" placeholder="admin@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center"><Key className="w-4 h-4 mr-2" />Senha</label>
              <input type="password" value={loginData.password} onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" placeholder="Digite a senha" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">Entrar</button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div><p className="text-gray-400">Carregando dados...</p></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-lg shadow-2xl overflow-hidden border border-slate-700">
      <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => refreshData()} 
            className="flex items-center px-4 py-2 text-blue-400 hover:bg-blue-900/50 rounded-lg transition-colors"
            title="Atualizar dados do painel"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Atualizar Dados</span>
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center px-4 py-2 text-red-400 hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </div>

      <div className="flex border-b border-slate-700 overflow-x-auto">
        <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
          Dashboard
        </button>
        <button onClick={() => setActiveTab('equipment')} className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'equipment' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
          Equipamento
        </button>
        <button onClick={() => setActiveTab('bookings')} className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'bookings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
          Histórico
        </button>
        <button onClick={() => setActiveTab('help')} className={`px-6 py-3 font-medium whitespace-nowrap transition-colors ${activeTab === 'help' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-slate-700'}`}>
          Ajuda
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'dashboard' && (
           <div className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Dashboard de Estatísticas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-900/50 p-6 rounded-lg border border-blue-700"><div className="flex items-center"><BarChart3 className="w-8 h-8 text-blue-400 mr-3" /><div><p className="text-sm text-blue-400 font-medium">Total de Reservas</p><p className="text-2xl font-bold text-white">{dashboardStats.totalBookings}</p></div></div></div>
                <div className="bg-green-900/50 p-6 rounded-lg border border-green-700"><div className="flex items-center"><TrendingUp className="w-8 h-8 text-green-400 mr-3" /><div><p className="text-sm text-green-400 font-medium">Reservas Ativas</p><p className="text-2xl font-bold text-white">{dashboardStats.activeBookings}</p></div></div></div>
                <div className="bg-red-900/50 p-6 rounded-lg border border-red-700"><div className="flex items-center"><X className="w-8 h-8 text-red-400 mr-3" /><div><p className="text-sm text-red-400 font-medium">Reservas Encerradas</p><p className="text-2xl font-bold text-white">{dashboardStats.expiredBookings}</p></div></div></div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Status Atual dos Equipamentos</h2>
              <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
                <EquipmentStatus equipment={equipment} usage={equipmentUsage} loading={loading} />
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
              <h3 className="font-bold text-white mb-4">Equipamentos Mais Solicitados</h3>
              {dashboardStats.mostRequestedEquipment.length > 0 ? (
                <div className="space-y-3">{dashboardStats.mostRequestedEquipment.map((item, index) => (<div key={index} className="flex justify-between items-center bg-slate-800 p-3 rounded"><span className="font-medium text-gray-300">{item.name}</span><span className="text-blue-400 font-bold">{item.count} unidades reservadas</span></div>))}</div>
              ) : (<p className="text-gray-500">Nenhum equipamento solicitado ainda.</p>)}
            </div>
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Gerenciar Equipamentos</h2>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <h3 className="font-medium text-white mb-4">Adicionar Novo Equipamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input type="text" placeholder="Nome do equipamento" value={newEquipmentData.name || ''} onChange={(e) => setNewEquipmentData(prev => ({ ...prev, name: e.target.value }))} className="px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Categoria" value={newEquipmentData.category || ''} onChange={(e) => setNewEquipmentData(prev => ({ ...prev, category: e.target.value }))} className="px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Quantidade total" value={newEquipmentData.total_quantity || ''} onChange={(e) => setNewEquipmentData(prev => ({ ...prev, total_quantity: parseInt(e.target.value) || 0 }))} className="px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500" />
                <button onClick={handleAddEquipment} className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-green-700"><Plus className="w-4 h-4 mr-2" />Adicionar</button>
              </div>
            </div>
            <div className="space-y-4">{equipment.map((eq) => (<div key={eq.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">{editingEquipment?.id === eq.id ? (<div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center"><input type="text" value={editingEquipment.name} onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, name: e.target.value } : null)} className="px-3 py-2 border border-slate-600 rounded bg-slate-700 text-white focus:ring-2 focus:ring-blue-500" /><input type="text" value={editingEquipment.category} onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, category: e.target.value } : null)} className="px-3 py-2 border border-slate-600 rounded bg-slate-700 text-white focus:ring-2 focus:ring-blue-500" /><input type="number" value={editingEquipment.total_quantity || ''} onChange={(e) => setEditingEquipment(prev => prev ? { ...prev, total_quantity: parseInt(e.target.value) || 0 } : null)} className="px-3 py-2 border border-slate-600 rounded bg-slate-700 text-white focus:ring-2 focus:ring-blue-500" /><div className="flex space-x-2"><button onClick={handleUpdateEquipment} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center justify-center hover:bg-blue-700"><Save className="w-4 h-4" /></button><button onClick={() => setEditingEquipment(null)} className="bg-gray-600 text-white px-3 py-2 rounded flex items-center justify-center hover:bg-gray-700"><X className="w-4 h-4" /></button></div></div>) : (<div className="flex justify-between items-center"><div><h3 className="font-medium text-white">{eq.name}</h3><p className="text-sm text-gray-400">Categoria: {eq.category}</p><p className="text-sm text-gray-400">Quantidade Total: {eq.total_quantity}</p></div><div className="flex space-x-2"><button onClick={() => setEditingEquipment(eq)} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center hover:bg-blue-700"><Edit className="w-4 h-4" /></button><button onClick={() => handleDeleteEquipment(eq.id)} className="bg-red-600 text-white px-3 py-2 rounded flex items-center hover:bg-red-700"><Trash2 className="w-4 h-4" /></button></div></div>)}</div>))}</div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Histórico de Agendamentos</h2>
            <div className="space-y-4">{bookings.map((booking) => (<div key={booking.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4">{editingBooking?.id === booking.id ? (
              <div className="space-y-4">
                <h3 className="font-medium text-white mb-2">Editando Agendamento de {booking.full_name}</h3>
                <div>
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <select
                      value={editingBooking.status}
                      onChange={(e) => setEditingBooking(prev => prev ? { ...prev, status: e.target.value as Booking['status'] } : null)}
                      className="w-full mt-1 px-3 py-2 border border-slate-600 rounded bg-slate-700 text-white focus:ring-2 focus:ring-blue-500"
                  >
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="expired">Encerrado</option>
                  </select>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Equipamentos</h4>
                  <div className="space-y-2">
                    {editingBookingEquipment.map(eq => (
                      <div key={eq.equipment_id} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                        <span className="text-gray-300">{eq.equipment_name}</span>
                        <div className="flex items-center space-x-2">
                          <input type="number" value={eq.quantity} onChange={e => handleUpdateBookingEquipment(eq.equipment_id, parseInt(e.target.value))} className="w-20 px-2 py-1 border border-slate-600 rounded bg-slate-800 text-white" />
                          {availabilityErrors[eq.equipment_id] && <p className="text-red-400 text-xs">{availabilityErrors[eq.equipment_id]}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleSaveBookingUpdate} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"><Save className="w-4 h-4 mr-2" />Salvar</button>
                  <button onClick={() => setEditingBooking(null)} className="bg-gray-600 text-white px-4 py-2 rounded flex items-center hover:bg-gray-700"><X className="w-4 h-4 mr-2" />Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-white">{booking.full_name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusStyles(booking.status)}`}>
                      {statusTextMap[booking.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Sala: {booking.classroom}</p>
                  <p className="text-sm text-gray-400">Data: {new Date(booking.booking_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                  <p className="text-sm text-gray-400">Horário: {booking.start_time} - {booking.end_time}</p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-300">Equipamentos:</p>
                    <ul className="text-sm text-gray-400 list-disc list-inside">
                      {booking.equipment?.map((item, index) => (
                        <li key={index}>{item.equipment_name} (Qtd: {item.quantity})</li>
                      )) || <li>Nenhum equipamento</li>}
                    </ul>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button onClick={() => startEditingBooking(booking)} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center hover:bg-blue-700"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDeleteBooking(booking.id)} className="bg-red-600 text-white px-3 py-2 rounded flex items-center hover:bg-red-700"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}</div>))}</div>
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center"><HelpCircle className="w-6 h-6 mr-3 text-blue-400" />Gerenciar Conteúdo da Página de Ajuda</h2>
            <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Texto de Ajuda</label>
                <textarea
                  value={helpSettings.help_text || ''}
                  onChange={(e) => setHelpSettings(prev => ({ ...prev, help_text: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite as instruções ou informações de ajuda aqui..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">URL do Vídeo do YouTube</label>
                <input
                  type="text"
                  value={helpSettings.help_video_url || ''}
                  onChange={(e) => setHelpSettings(prev => ({ ...prev, help_video_url: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-600 rounded bg-slate-800 text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveHelpSettings}
                  className="bg-green-600 text-white px-6 py-2 rounded flex items-center justify-center hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
