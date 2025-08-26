import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, MapPin, Calendar, Clock, ArrowRight, AlertTriangle, ArrowLeft, Check, Laptop, Tablet, Mic, Speaker, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookingFormData, Equipment } from '../types';
import { useNavigate } from 'react-router-dom';

export const BookingForm: React.FC = () => {
  const { getAvailableEquipment, addBooking, showNotification } = useApp();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingFormData>({
    professorName: '',
    location: '',
    date: '',
    startTime: '',
    endTime: '',
    selectedEquipment: []
  });
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!formData.professorName || !formData.location || !formData.date || !formData.startTime || !formData.endTime) {
        showNotification('Por favor, preencha todos os campos.', 'error');
        return;
      }
      
      const startDate = new Date(`${formData.date}T${formData.startTime}`);
      const endDate = new Date(`${formData.date}T${formData.endTime}`);
      
      if (startDate >= endDate) {
        showNotification('A hora de término deve ser posterior à hora de início.', 'error');
        return;
      }
      
      try {
        const available = await getAvailableEquipment(formData.date, formData.startTime, formData.endTime);
        
        const equipmentOrder = ['Notebook', 'Tablet', 'Microfone', 'Caixa de som'];
        const sortedAvailable = [...available].sort((a, b) => {
          const indexA = equipmentOrder.indexOf(a.name);
          const indexB = equipmentOrder.indexOf(b.name);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.name.localeCompare(b.name);
        });

        setAvailableEquipment(sortedAvailable);
        setCurrentStep(2);
      } catch (error) {
        console.error("Error checking equipment availability:", error);
        showNotification('Não foi possível verificar a disponibilidade. Tente novamente.', 'error');
      }
    }
  };
  
  const handleGoToConfirmation = () => {
    if (formData.selectedEquipment.length === 0) {
      showNotification('Por favor, selecione pelo menos um equipamento.', 'error');
      return;
    }
    setCurrentStep(3);
  };

  const handleEquipmentSelection = (equipment: Equipment, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      selectedEquipment: prev.selectedEquipment
        .filter(item => item.id !== equipment.id)
        .concat(quantity > 0 ? [{ id: equipment.id, name: equipment.name, quantity }] : [])
    }));
  };

  const handleSubmit = async () => {
    try {
      const bookingDetails = {
        full_name: formData.professorName,
        classroom: formData.location,
        booking_date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
      };

      const equipmentList = formData.selectedEquipment.map(eq => ({
        equipment_id: eq.id,
        quantity: eq.quantity
      }));

      await addBooking(bookingDetails, equipmentList);
      navigate('/historico');
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

  const allEquipmentInUse = availableEquipment.length > 0 && availableEquipment.every(eq => eq.total_quantity === 0);

  const getEquipmentIcon = (name: string, size = 'w-8 h-8') => {
    const props = { className: `${size} text-text-secondary` };
    if (name.toLowerCase().includes('notebook')) return <Laptop {...props} />;
    if (name.toLowerCase().includes('tablet')) return <Tablet {...props} />;
    if (name.toLowerCase().includes('microfone')) return <Mic {...props} />;
    if (name.toLowerCase().includes('caixa de som')) return <Speaker {...props} />;
    return <Package {...props} />;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  const steps = [
    { number: 1, label: 'Informações' },
    { number: 2, label: 'Equipamentos' },
    { number: 3, label: 'Confirmação' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  currentStep > step.number
                    ? 'bg-green-500 text-white'
                    : currentStep === step.number
                    ? 'bg-transparent border-2 border-white text-white'
                    : 'bg-input-bg text-text-secondary'
                }`}
              >
                {currentStep > step.number ? <Check size={18} /> : step.number}
              </div>
              <p className={`mt-2 text-sm font-medium ${currentStep >= step.number ? 'text-green-400' : 'text-text-secondary'}`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 md:w-24 h-0.5 mx-2 transition-all duration-300 ${
                  currentStep > step.number ? 'bg-green-500' : 'bg-input-bg'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-form-bg rounded-2xl p-6 md:p-8 shadow-lg border border-border-dark">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8"><h2 className="text-2xl font-bold text-white">Informações do Agendamento</h2><p className="text-text-secondary mt-1">Preencha os dados básicos para o agendamento</p></div>
              <div className="space-y-6">
                <div><label className="flex items-center text-sm font-medium text-text-secondary mb-2"><User className="w-4 h-4 mr-2" />Nome do Professor</label><input type="text" value={formData.professorName} onChange={(e) => setFormData(prev => ({ ...prev, professorName: e.target.value }))} className="w-full px-4 py-3 bg-input-bg border border-border-dark rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-gray-500" placeholder="Digite seu nome completo" /></div>
                <div><label className="flex items-center text-sm font-medium text-text-secondary mb-2"><MapPin className="w-4 h-4 mr-2" />Local</label><input type="text" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-4 py-3 bg-input-bg border border-border-dark rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-gray-500" placeholder="Sala, laboratório, auditório..." /></div>
                <div><label className="flex items-center text-sm font-medium text-text-secondary mb-2"><Calendar className="w-4 h-4 mr-2" />Data</label><input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-input-bg border border-border-dark rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent placeholder:text-gray-500" /></div>
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="flex items-center text-sm font-medium text-text-secondary mb-2"><Clock className="w-4 h-4 mr-2" />Hora Início</label><input type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))} className="w-full px-4 py-3 bg-input-bg border border-border-dark rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent" /></div>
                  <div><label className="flex items-center text-sm font-medium text-text-secondary mb-2"><Clock className="w-4 h-4 mr-2" />Hora Término</label><input type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))} className="w-full px-4 py-3 bg-input-bg border border-border-dark rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent" /></div>
                </div>
                <button type="button" onClick={handleNextStep} className="w-full flex items-center justify-center px-4 py-3 bg-btn-bg text-white rounded-lg font-semibold hover:bg-btn-bg-hover transition-colors"><ArrowRight className="w-5 h-5 ml-2" />Próximo</button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }} className="space-y-6">
              <div className="text-center"><h2 className="text-2xl font-bold text-white">Selecione os Equipamentos</h2><p className="text-text-secondary mt-1">Defina a quantidade para cada item disponível</p></div>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {allEquipmentInUse ? (<div className="flex flex-col items-center justify-center p-6 bg-yellow-900/30 border border-yellow-700 rounded-lg text-center"><AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" /><p className="text-lg font-bold text-yellow-300">TODOS JÁ ESTÃO EM USO</p><p className="text-sm text-yellow-400">Não há equipamentos disponíveis para este horário.</p></div>) : availableEquipment.length > 0 ? (availableEquipment.map((equipment) => { const selectedItem = formData.selectedEquipment.find(item => item.id === equipment.id); const selectedQuantity = selectedItem ? selectedItem.quantity : 0; return (<div key={equipment.id} className={`p-4 border border-border-dark bg-input-bg rounded-lg transition-opacity ${equipment.total_quantity === 0 ? 'opacity-60' : ''}`}><div className="flex justify-between items-center mb-4"><div><h3 className="font-medium text-white">{equipment.name}</h3><p className="text-sm text-text-secondary">Disponível: {equipment.total_quantity} unidades</p></div></div><div className="flex items-center space-x-4"><label className="text-sm font-medium text-text-secondary">Quantidade:</label><input type="number" min="0" max={equipment.total_quantity} value={selectedQuantity} disabled={equipment.total_quantity === 0} onChange={(e) => { const quantity = parseInt(e.target.value) || 0; if (quantity > equipment.total_quantity) { showNotification(`Disponível apenas ${equipment.total_quantity} unidades de ${equipment.name}`, 'info'); return; } handleEquipmentSelection(equipment, quantity); }} className="w-20 px-2 py-1 bg-form-bg border border-border-dark rounded focus:ring-2 focus:ring-white/50 focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed" /></div></div>); })) : (<div className="text-center py-8 text-text-secondary">Nenhum equipamento disponível para o horário selecionado.</div>)}
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-btn-bg text-white rounded-lg font-semibold hover:bg-btn-bg-hover transition-colors">Anterior</button>
                <button onClick={handleGoToConfirmation} disabled={allEquipmentInUse} className="flex items-center justify-center px-6 py-3 bg-btn-bg text-white rounded-lg font-semibold hover:bg-btn-bg-hover transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">Próximo<ArrowRight className="w-5 h-5 ml-2" /></button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center mb-8"><Check className="w-6 h-6 mr-3 text-white" /><h2 className="text-2xl font-bold text-white">Confirmar Agendamento</h2></div>
              <div className="space-y-4">
                <div className="bg-input-bg p-4 rounded-lg"><h3 className="flex items-center text-lg font-semibold mb-3"><User className="w-5 h-5 mr-2 text-text-secondary" />Informações do Professor</h3><p className="text-white"><span className="text-text-secondary">Nome:</span> {formData.professorName}</p></div>
                <div className="bg-input-bg p-4 rounded-lg"><h3 className="flex items-center text-lg font-semibold mb-3"><Calendar className="w-5 h-5 mr-2 text-text-secondary" />Agendamento</h3><p className="text-white"><span className="text-text-secondary">Data:</span> {formatDate(formData.date)}</p><p className="text-white"><span className="text-text-secondary">Horário:</span> {formData.startTime} - {formData.endTime}</p><p className="text-white"><span className="text-text-secondary">Local:</span> {formData.location}</p></div>
                <div className="bg-input-bg p-4 rounded-lg"><h3 className="flex items-center text-lg font-semibold mb-3"><Package className="w-5 h-5 mr-2 text-text-secondary" />Equipamentos Selecionados</h3><div className="space-y-3">{formData.selectedEquipment.map(item => (<div key={item.id} className="flex items-center justify-between"><div className="flex items-center">{getEquipmentIcon(item.name, 'w-6 h-6')}<span className="ml-4 text-white">{item.name}</span></div><span className="text-text-secondary">{item.quantity} unidades</span></div>))}</div></div>
              </div>
              <div className="flex justify-between mt-8">
                <button onClick={() => setCurrentStep(2)} className="flex items-center justify-center px-6 py-3 bg-btn-bg text-white rounded-lg font-semibold hover:bg-btn-bg-hover transition-colors"><ArrowLeft className="w-5 h-5 mr-2" />Voltar</button>
                <button onClick={handleSubmit} className="flex items-center justify-center px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors"><Check className="w-5 h-5 mr-2" />Confirmar Agendamento</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
