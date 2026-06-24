import type { Metadata } from 'next';
import LegalLayout from '@/components/legal/LegalLayout';

export const metadata: Metadata = { title: 'Métricas — Novu' };

export default function MetricasPage() {
  return (
    <LegalLayout title="Tu negocio en una pantalla." lastUpdated="">
      <div className="legal-highlight">
        Cuánto facturaste, quién genera más ingresos, qué servicio es el más pedido, cuándo está tu agenda más llena. Todo en tiempo real, sin planillas ni cálculos manuales.
      </div>

      <div className="legal-section">
        <h2>Los números que importan</h2>
        <p>De un vistazo podés ver tus ingresos del período, cuántas citas tuviste, cuál es tu ticket promedio y qué porcentaje de citas terminaron pagadas. Disponible desde el plan gratis con el historial completo.</p>
      </div>

      <div className="legal-section">
        <h2>Por profesional y por servicio</h2>
        <p>Sabé qué profesional genera más ingresos y qué servicio es el más solicitado. Útil para tomar decisiones sobre horarios, precios y en qué enfocarte para crecer.</p>
        <p>Disponible en el plan Pro.</p>
      </div>

      <div className="legal-section">
        <h2>Mapa de ocupación</h2>
        <p>Un mapa visual que muestra en qué días y horarios recibís más citas. Sabés exactamente cuándo está tu agenda al tope y cuándo tiene huecos — para ajustar horarios, publicitar turnos disponibles o planificar descansos.</p>
        <p>Disponible en el plan Pro.</p>
      </div>

      <div className="legal-section">
        <h2>Tus mejores clientes</h2>
        <p>Mirá quiénes son los clientes que más te visitan y cuánto gastan. Podés usarlo para dar prioridad a tus clientes frecuentes o armar promociones para los que hace tiempo no vienen.</p>
        <p>Disponible en el plan Pro.</p>
      </div>

      <div className="legal-section">
        <h2>Proyección del mes</h2>
        <p>A mitad de mes, Novu te muestra cuánto vas a cerrar si seguís al ritmo actual. Una estimación simple basada en tus datos reales, para que no llegues a fin de mes con sorpresas.</p>
        <p>Disponible en el plan Pro.</p>
      </div>

      <div className="legal-section">
        <h2>Exportación de reportes</h2>
        <p>Podés exportar cualquier reporte a CSV o Excel para compartirlo con tu contador o analizarlo como quieras. También podés generar un PDF con el resumen del período.</p>
        <p>CSV disponible en el plan Pro. Excel y PDF en el plan Negocio.</p>
      </div>
    </LegalLayout>
  );
}
