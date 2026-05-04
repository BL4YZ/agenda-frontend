import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = { title: 'Términos de Servicio — MiAgenda' };

export default function TermsPage() {
  return (
    <LegalLayout title="Términos de Servicio" lastUpdated="27 de abril de 2026">
      <div className="legal-highlight">
        Al crear una cuenta o utilizar MiAgenda aceptás estos términos en su totalidad.
        Si no estás de acuerdo, no uses el servicio.
      </div>

      <div className="legal-section">
        <h2>1. El servicio</h2>
        <p>
          MiAgenda es una plataforma de gestión de turnos y agenda para profesionales y pequeñas empresas.
          Permite administrar citas, clientes, servicios, sucursales y cobros a través de una interfaz web.
        </p>
        <p>
          El servicio se presta "tal cual está". Hacemos nuestro mejor esfuerzo para mantenerlo disponible
          las 24 horas, pero no garantizamos disponibilidad ininterrumpida.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Tu cuenta</h2>
        <ul>
          <li>Debes tener al menos 18 años para crear una cuenta.</li>
          <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
          <li>Debes proporcionar información veraz al registrarte.</li>
          <li>Una cuenta corresponde a un negocio. No podés compartir cuentas entre distintos titulares.</li>
          <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Planes y pagos</h2>
        <p>
          MiAgenda ofrece un período de prueba gratuito de 14 días con acceso completo al plan Pro.
          Al finalizar el período de prueba podés continuar con el plan gratuito o contratar un plan pago.
        </p>
        <ul>
          <li>Los pagos se procesan a través de <strong>Mercado Pago</strong>.</li>
          <li>Los precios se expresan en pesos uruguayos (UYU) salvo indicación contraria.</li>
          <li>Las suscripciones se renuevan automáticamente al vencimiento del período.</li>
          <li>Podés cancelar tu suscripción en cualquier momento desde el panel de configuración.</li>
          <li>No realizamos reembolsos por períodos ya facturados, salvo error de nuestra parte.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Uso aceptable</h2>
        <p>Al usar MiAgenda te comprometés a:</p>
        <ul>
          <li>No usar el servicio para actividades ilegales o fraudulentas.</li>
          <li>No intentar acceder a cuentas o datos de otros usuarios.</li>
          <li>No realizar ingeniería inversa, copiar o redistribuir el software.</li>
          <li>No enviar comunicaciones no solicitadas (spam) a través de la plataforma.</li>
          <li>No sobrecargar intencionalmente nuestra infraestructura.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Tus datos</h2>
        <p>
          Sos el propietario de los datos que cargás en MiAgenda (clientes, citas, servicios).
          Podés exportarlos o eliminarlos en cualquier momento desde el panel de configuración.
          Al eliminar tu cuenta, tus datos se borran de forma permanente en un plazo de 30 días.
        </p>
        <p>
          Consultá nuestra <a href="/privacy">Política de Privacidad</a> para más detalles sobre
          cómo tratamos tus datos personales.
        </p>
      </div>

      <div className="legal-section">
        <h2>6. Propiedad intelectual</h2>
        <p>
          El software, diseño, marca y contenidos de MiAgenda son propiedad de sus creadores y
          están protegidos por las leyes de propiedad intelectual vigentes en la República Oriental del Uruguay.
          Te otorgamos una licencia limitada, no exclusiva e intransferible para usar el servicio.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Limitación de responsabilidad</h2>
        <p>
          MiAgenda no será responsable por daños indirectos, incidentales o consecuentes derivados
          del uso o la imposibilidad de uso del servicio, incluyendo pero no limitado a:
          pérdida de ganancias, pérdida de datos o interrupción del negocio.
        </p>
        <p>
          Nuestra responsabilidad total no superará el monto pagado por el usuario en los
          últimos 3 meses de servicio.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Modificaciones</h2>
        <p>
          Podemos actualizar estos términos ocasionalmente. Te notificaremos por email con al menos
          15 días de anticipación ante cambios significativos. El uso continuado del servicio
          luego de la notificación implica aceptación de los nuevos términos.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier
          disputa se someterá a la jurisdicción de los tribunales ordinarios de Montevideo,
          renunciando a cualquier otro fuero.
        </p>
      </div>

      <div className="legal-section">
        <h2>10. Contacto</h2>
        <p>
          Para consultas sobre estos términos escribinos a{' '}
          <a href="mailto:soporte@miagenda.app">soporte@miagenda.app</a>.
        </p>
      </div>
    </LegalLayout>
  );
}
