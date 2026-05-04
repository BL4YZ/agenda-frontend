'use client';

import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';

export type EventInfo = {
    id: string;
    title: string;
    start: Date | null;
    end: Date | null;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    event: EventInfo | null;
    onAppointmentCancel: (eventId: string) => void;
};

export default function AppointmentModal({ isOpen, onClose, event, onAppointmentCancel }: Props) {
    if (!isOpen || !event || !event.start || !event.end) {
        return null;
    }

    const handleCancel = async () => {
        if (window.confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
            try {
                await axios.delete(`http://localhost:3000/api/appointments/${event.id}`);
                onAppointmentCancel(event.id);
                onClose();
            } catch (error) {
                console.error('Error al cancelar la cita', error);
                alert('No se pudo cancelar la cita.');
            }
        }
    };

    // Hemos eliminado <Transition> para simplificar la depuración
    return (
        <Dialog as="div" className="relative z-[9999]" open={isOpen} onClose={onClose}>
            <div className="fixed inset-0 bg-black bg-opacity-25" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl">
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Detalles de la Cita
                        </Dialog.Title>
                        <div className="mt-4">
                            <p className="text-sm text-gray-700"><strong>Servicio:</strong> {event.title}</p>
                            <p className="text-sm text-gray-700 mt-2">
                                <strong>Inicio:</strong> {format(event.start, "eeee, d 'de' LLLL 'a las' HH:mm", { locale: es })}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                                <strong>Fin:</strong> {format(event.end, "HH:mm", { locale: es })}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cerrar
                            </button>
                            <button type="button" onClick={handleCancel} className="rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200">
                                Cancelar Cita
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </div>
        </Dialog>
    );
}