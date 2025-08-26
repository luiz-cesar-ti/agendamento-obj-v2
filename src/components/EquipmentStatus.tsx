import React from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { Equipment } from '../types';

interface EquipmentStatusProps {
  equipment: Equipment[];
  usage: Record<string, number>;
  loading: boolean;
}

const EquipmentStatusCard: React.FC<{ item: Equipment; used: number }> = ({ item, used }) => {
  const available = item.total_quantity - used;
  const usagePercentage = item.total_quantity > 0 ? (used / item.total_quantity) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3"
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-white flex items-center">
          <Package size={18} className="mr-3 text-blue-400" />
          {item.name}
        </h3>
        <span className="text-xs text-gray-400 font-mono">Total: {item.total_quantity}</span>
      </div>
      <div className="space-y-2">
        <div className="w-full bg-slate-900 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 50 ? 'bg-yellow-500' : 'bg-blue-600'}`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center text-yellow-400">
            <Clock size={14} className="mr-1.5" />
            Em Uso: {used}
          </span>
          <span className="flex items-center text-green-400">
            <CheckCircle size={14} className="mr-1.5" />
            Disponível: {available}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export const EquipmentStatus: React.FC<EquipmentStatusProps> = ({ equipment, usage, loading }) => {
  if (loading) {
    return <div className="text-center text-gray-400">Verificando status dos equipamentos...</div>;
  }

  if (equipment.length === 0) {
    return <div className="text-center text-gray-500">Nenhum equipamento cadastrado.</div>;
  }

  // Sort equipment alphabetically by name
  const sortedEquipment = [...equipment].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedEquipment.map(eq => (
        <EquipmentStatusCard key={eq.id} item={eq} used={usage[eq.id] || 0} />
      ))}
    </div>
  );
};
