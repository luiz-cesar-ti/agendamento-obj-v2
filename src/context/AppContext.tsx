import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Equipment, Booking, DashboardStats, BookingEquipment, AdminSettings } from '../types';
import { supabase } from '../lib/supabase';
import { Toast } from '../components/Toast';
import { Session } from '@supabase/supabase-js';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
}

type BookingDetails = Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status' | 'equipment'>;
type EquipmentSelection = { equipment_id: string; quantity: number };

interface AppContextType {
  session: Session | null;
  equipment: Equipment[];
  equipmentUsage: Record<string, number>;
  bookings: Booking[];
  dashboardStats: DashboardStats;
  helpContent: AdminSettings | null;
  loading: boolean;
  notification: NotificationState | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<void>;
  updateEquipment: (equipment: Equipment) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
  addBooking: (bookingDetails: BookingDetails, equipmentList: EquipmentSelection[]) => Promise<void>;
  updateBooking: (bookingId: string, updates: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'equipment'>>, newEquipment: Omit<BookingEquipment, 'id' | 'booking_id'>[]) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  getAvailableEquipment: (date: string, startTime: string, endTime: string, bookingIdToIgnore?: string) => Promise<Equipment[]>;
  getBookingsByDate: (date: string) => Promise<Booking[]>;
  checkBookingExpiration: () => Promise<void>;
  loadDashboardStats: () => Promise<void>;
  updateHelpContent: (settings: Partial<AdminSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [equipmentUsage, setEquipmentUsage] = useState<Record<string, number>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeBookings: 0,
    expiredBookings: 0,
    mostRequestedEquipment: []
  });
  const [helpContent, setHelpContent] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  const loadEquipment = useCallback(async () => {
    const { data, error } = await supabase.from('equipment').select('*').order('name');
    if (error) console.error('Error loading equipment:', error);
    else setEquipment(data || []);
  }, []);

  const loadBookings = useCallback(async () => {
    const { data, error } = await supabase.from('bookings').select(`*, booking_equipment (*, equipment(name))`).order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading bookings:', error);
      return;
    }
    const formattedBookings = (data || []).map(b => ({
      ...b,
      equipment: b.booking_equipment?.map(be => ({
        id: be.id,
        booking_id: b.id,
        equipment_id: be.equipment_id,
        equipment_name: be.equipment?.name || 'Desconhecido',
        quantity: be.quantity
      })) || []
    }));
    setBookings(formattedBookings);
  }, []);

  const loadDashboardStats = useCallback(async () => {
    const { count: totalCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    const { count: activeCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']);
    
    const { data: equipmentStats, error } = await supabase.from('booking_equipment').select(`quantity, equipment(name)`);
    if(error) {
        console.error("Error fetching equipment stats for dashboard", error);
        return;
    }
    
    const equipmentCounts: Record<string, { name: string; count: number }> = {};
    equipmentStats?.forEach(item => {
        const name = item.equipment?.name || 'Unknown';
        if (!equipmentCounts[name]) {
            equipmentCounts[name] = { name, count: 0 };
        }
        equipmentCounts[name].count += item.quantity;
    });

    const mostRequestedEquipment = Object.values(equipmentCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    setDashboardStats({
        totalBookings: totalCount || 0,
        activeBookings: activeCount || 0,
        expiredBookings: (totalCount || 0) - (activeCount || 0),
        mostRequestedEquipment
    });
  }, []);

  const loadCurrentUsage = useCallback(async () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);

    const { data: activeBookings, error } = await supabase
        .from('bookings')
        .select('booking_equipment(equipment_id, quantity)')
        .in('status', ['pending', 'confirmed'])
        .eq('booking_date', currentDate)
        .lte('start_time', currentTime)
        .gt('end_time', currentTime);

    if (error) {
        console.error('Error loading current equipment usage:', error);
        setEquipmentUsage({});
        return;
    }

    const usage: Record<string, number> = {};
    activeBookings?.forEach(booking => {
        booking.booking_equipment?.forEach(item => {
            if (usage[item.equipment_id]) {
                usage[item.equipment_id] += item.quantity;
            } else {
                usage[item.equipment_id] = item.quantity;
            }
        });
    });
    
    setEquipmentUsage(usage);
  }, []);

  const loadHelpContent = useCallback(async () => {
    const { data, error } = await supabase.from('admin_settings').select('*').eq('id', 1).single();
    if (error) console.error('Error loading help content:', error);
    else setHelpContent(data);
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadEquipment(), loadBookings(), loadDashboardStats(), loadCurrentUsage(), loadHelpContent()]);
    setLoading(false);
  }, [loadEquipment, loadBookings, loadDashboardStats, loadCurrentUsage, loadHelpContent]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addEquipment = useCallback(async (newEquipment: Omit<Equipment, 'id'>) => {
    const { data, error } = await supabase.from('equipment').insert([newEquipment]).select();
    if (error) {
      showNotification('Erro de banco de dados ao adicionar.', 'error');
      console.error('Error adding equipment:', error);
      throw error;
    }
    if (!data || data.length === 0) {
      showNotification('Falha ao adicionar. Verifique as permissões (RLS) no Supabase.', 'error');
      throw new Error('Add equipment failed, likely RLS issue.');
    }
    showNotification('Equipamento adicionado com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  const updateEquipment = useCallback(async (updatedEquipment: Equipment) => {
    const { data, error } = await supabase.from('equipment').update({ name: updatedEquipment.name, total_quantity: updatedEquipment.total_quantity, category: updatedEquipment.category }).eq('id', updatedEquipment.id).select();
    if (error) {
      showNotification('Erro de banco de dados ao atualizar.', 'error');
      console.error('Error updating equipment:', error);
      throw error;
    }
    if (!data || data.length === 0) {
      showNotification('Falha ao atualizar. Verifique as permissões (RLS) no Supabase.', 'error');
      throw new Error('Update equipment failed, likely RLS issue.');
    }
    showNotification('Equipamento atualizado com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  const deleteEquipment = useCallback(async (id: string) => {
    const { data, error } = await supabase.from('equipment').delete().eq('id', id).select();
    if (error) {
      if (error.code === '23503') {
        showNotification('Não é possível remover. Equipamento está em uso.', 'error');
      } else {
        showNotification('Erro de banco de dados ao remover.', 'error');
      }
      console.error('Error deleting equipment:', error);
      throw error;
    }
    if (!data || data.length === 0) {
      showNotification('Falha ao remover. Verifique as permissões (RLS) no Supabase.', 'error');
      throw new Error('Delete equipment failed, likely RLS issue.');
    }
    showNotification('Equipamento removido com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  const addBooking = useCallback(async (bookingDetails: BookingDetails, equipmentList: EquipmentSelection[]) => {
    const payload = {
      full_name: bookingDetails.full_name,
      classroom: bookingDetails.classroom,
      booking_date: bookingDetails.booking_date,
      start_time: bookingDetails.start_time,
      end_time: bookingDetails.end_time,
      status: 'pending' as const
    };

    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert([payload])
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      showNotification('Erro ao criar agendamento. Verifique os dados e tente novamente.', 'error');
      throw bookingError;
    }

    if (!newBooking) {
      const rlsError = new Error('A criação do agendamento falhou. A operação de inserção não retornou dados, o que geralmente indica um problema com as Políticas de Segurança de Nível de Linha (RLS) que impedem a inserção ou a leitura do novo registro.');
      console.error(rlsError);
      showNotification('Falha ao registrar o agendamento. A permissão foi negada pelo banco de dados.', 'error');
      throw rlsError;
    }

    if (equipmentList && equipmentList.length > 0) {
      const equipmentInserts = equipmentList.map(eq => ({
        booking_id: newBooking.id,
        equipment_id: eq.equipment_id,
        quantity: eq.quantity,
      }));
      const { error: equipmentError } = await supabase.from('booking_equipment').insert(equipmentInserts);
      if (equipmentError) {
        console.error("Error associating equipment:", equipmentError);
        showNotification('Erro ao associar equipamentos ao agendamento.', 'error');
        await supabase.from('bookings').delete().eq('id', newBooking.id);
        throw equipmentError;
      }
    }
    
    showNotification('Agendamento registrado com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  const updateBooking = useCallback(async (bookingId: string, updates: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'equipment'>>, newEquipment: Omit<BookingEquipment, 'id' | 'booking_id'>[]) => {
    const { error: updateError } = await supabase.from('bookings').update(updates).eq('id', bookingId);
    if (updateError) {
      showNotification('Erro ao atualizar o agendamento.', 'error');
      throw updateError;
    }
    const { error: deleteError } = await supabase.from('booking_equipment').delete().eq('booking_id', bookingId);
    if (deleteError) {
      showNotification('Erro ao atualizar equipamentos do agendamento.', 'error');
      throw deleteError;
    }
    if (newEquipment.length > 0) {
      const equipmentInserts = newEquipment.map(eq => ({ booking_id: bookingId, equipment_id: eq.equipment_id, quantity: eq.quantity }));
      const { error: insertError } = await supabase.from('booking_equipment').insert(equipmentInserts);
      if (insertError) {
        showNotification('Erro ao inserir novos equipamentos.', 'error');
        throw insertError;
      }
    }
    showNotification('Agendamento atualizado com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  const deleteBooking = useCallback(async (id: string) => {
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) {
      showNotification('Erro ao remover agendamento.', 'error');
      throw error;
    }
    showNotification('Agendamento removido com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  const getAvailableEquipment = useCallback(async (date: string, startTime: string, endTime: string, bookingIdToIgnore?: string): Promise<Equipment[]> => {
    const { data: allEquipment, error: equipmentError } = await supabase.from('equipment').select('*');
    if (equipmentError) {
      console.error('Error fetching equipment for availability check:', equipmentError);
      return [];
    }

    let query = supabase
        .from('bookings')
        .select(`booking_equipment (equipment_id, quantity)`)
        .eq('booking_date', date)
        .in('status', ['pending', 'confirmed'])
        .lt('start_time', endTime)
        .gt('end_time', startTime);

    if (bookingIdToIgnore) {
        query = query.neq('id', bookingIdToIgnore);
    }

    const { data: overlappingBookings, error: bookingError } = await query;
    if (bookingError) {
        console.error('Error fetching overlapping bookings:', bookingError);
        throw bookingError;
    }

    const equipmentUsage: Record<string, number> = {};
    overlappingBookings?.forEach(booking => {
        booking.booking_equipment?.forEach(item => {
            if (equipmentUsage[item.equipment_id]) {
                equipmentUsage[item.equipment_id] += item.quantity;
            } else {
                equipmentUsage[item.equipment_id] = item.quantity;
            }
        });
    });

    const availableEquipment = (allEquipment || []).map(eq => {
        const usedQuantity = equipmentUsage[eq.id] || 0;
        const availableQuantity = eq.total_quantity - usedQuantity;
        return {
            ...eq,
            total_quantity: Math.max(0, availableQuantity)
        };
    });

    return availableEquipment;
  }, []);

  const getBookingsByDate = useCallback(async (date: string): Promise<Booking[]> => {
    const { data, error } = await supabase.from('bookings').select(`*, booking_equipment (*, equipment(name))`).eq('booking_date', date).order('start_time');
    if (error) throw error;
    return (data || []).map(b => ({
      ...b,
      equipment: b.booking_equipment?.map(be => ({
        id: be.id,
        booking_id: b.id,
        equipment_id: be.equipment_id,
        equipment_name: be.equipment?.name || 'Desconhecido',
        quantity: be.quantity
      })) || []
    }));
  }, []);

  const checkBookingExpiration = useCallback(async () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].slice(0, 5);
    const { error } = await supabase.from('bookings').update({ status: 'expired' }).in('status', ['pending', 'confirmed']).or(`booking_date.lt.${currentDate},and(booking_date.eq.${currentDate},end_time.lt.${currentTime})`);
    if (error) console.error('Error checking booking expiration:', error);
    else await refreshData();
  }, [refreshData]);

  const updateHelpContent = useCallback(async (settings: Partial<AdminSettings>) => {
    const payload = { ...settings, id: 1 };
    const { error } = await supabase.from('admin_settings').upsert(payload);
    if (error) {
      showNotification('Erro ao atualizar o conteúdo da ajuda.', 'error');
      console.error('Error updating help content:', error);
      throw error;
    }
    showNotification('Conteúdo da ajuda atualizado com sucesso!', 'success');
    await refreshData();
  }, [refreshData]);

  return (
    <AppContext.Provider value={{ session, equipment, equipmentUsage, bookings, dashboardStats, helpContent, loading, notification, showNotification, addEquipment, updateEquipment, deleteEquipment, addBooking, updateBooking, deleteBooking, getAvailableEquipment, getBookingsByDate, checkBookingExpiration, loadDashboardStats, updateHelpContent, refreshData }}>
      {notification && <Toast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
