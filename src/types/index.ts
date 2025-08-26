export interface Equipment {
  id: string;
  name: string;
  total_quantity: number;
  category: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  full_name: string;
  classroom: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  created_at: string;
  updated_at?: string;
  equipment?: BookingEquipment[];
}

export interface BookingEquipment {
  id: string;
  booking_id: string;
  equipment_id: string;
  equipment_name: string;
  quantity: number;
}

export interface BookingFormData {
  professorName: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  selectedEquipment: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  expiredBookings: number;
  mostRequestedEquipment: Array<{
    name: string;
    count: number;
  }>;
}

export interface AdminSettings {
  id: number;
  help_text: string | null;
  help_video_url: string | null;
  created_at?: string;
  updated_at?: string;
}
