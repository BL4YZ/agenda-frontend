import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = { title: 'Términos de Servicio — MiAgenda' };

export default function TermsPage() {
  return (
    <LegalLayout title="Términos de Servicio" lastUpdated="6 de mayo de 2026">
      <div className="legal-highlight">
        Al crear una cuenta o utilizar MiAgenda aceptás estos términos en su totalidad.
        Si no estás de acuerdo, no uses el servicio.
      </div>

      <div className="legal-section">
        <h2>1. El servicio</h2>
        <p>
          MiAgenda es una plataforma de gestión de agenda y turnos para profesionales y pequeños negocios.
          Permite administrar citas, clientes, servicios, empleados, sucursales, cobros, gastos y comisiones
          a través de una interfaz web. Incluye una página pública de reservas para que tus clientes agenden
          turnos de forma autónoma.
        </p>
        <p>
          El servicio se presta "tal cual está". Hacemos nuestro mejor esfuerzo para mantenerlo disponible
          las 24 horas, pero no garantizamos disponibilidad ininterrumpida.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Tu cuenta</h2>
        <ul>
          <li>Debés tener al menos 18 años para crear una cuenta.</li>
          <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
          <li>Debés proporcionar información veraz al registrarte.</li>
          <li>Una cuenta de tipo <em>owner</em> corresponde a un negocio y puede invitar empleados.</li>
          <li>Los empleados que invitás acceden al sistema con permisos acotados definidos por vos.</li>
          <li>Nos reservamos el derecho de suspender cuentas que violen estos términos.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Planes y pagos</h2>
        <p>
          MiAgenda ofrece un plan gratuito con funciones básicas y un plan Pro con funciones avanzadas.
          El plan Pro incluye un período de prueba de 14 días al activarse por primera vez.
        </p>
        <ul>
          <li>
            <strong>Prueba gratuita:</strong> la prueba de 14 días del plan Pro se activa conectando
            una cuenta de <strong>Mercado Pago</strong>, lo que requiere tener un método de pago válido
            asociado a esa cuenta. No se realiza ningún cobro durante el período de prueba. Si cancelás
            antes de que finalice, no se te cobra nada.
          </li>
          <li>Los pagos se procesan a través de <strong>Mercado Pago</strong> mediante suscripciones recurrentes.</li>
          <li>Los precios se expresan en pesos uruguayos (UYU) salvo indicación contraria.</li>
          <li>Las suscripciones se renuevan automáticamente al vencimiento del período contratado.</li>
          <li>Podés cancelar tu suscripción en cualquier momento desde el panel de configuración.</li>
          <li>No realizamos reembolsos por períodos ya facturados, salvo error de nuestra parte.</li>
          <li>
            Ciertas funciones del plan Pro (gastos, comisiones, modalidades, más de un empleado) no
            están disponibles en el plan gratuito.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Página pública de reservas</h2>
        <p>
          Al activar la página pública, tu negocio queda accesible en una URL pública donde los clientes
          pueden ver tus servicios, empleados y horarios disponibles, y agendar turnos sin necesidad de
          crear una cuenta.
        </p>
        <ul>
          <li>Sos responsable de la información que exponés en tu página pública.</li>
          <li>Los datos de contacto que los clientes ingresan al reservar quedan asociados a tu cuenta.</li>
          <li>Podés desactivar la página pública en cualquier momento desde la configuración.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Uso aceptable</h2>
        <p>Al usar MiAgenda te comprometés a:</p>
        <ul>
          <li>No usar el servicio para actividades ilegales o fraudulentas.</li>
          <li>No intentar acceder a cuentas o datos de otros usuarios.</li>
          <li>No realizar ingeniería inversa, copiar o redistribuir el software.</li>
          <li>No enviar comunicaciones no solicitadas (spam) a través de la plataforma.</li>
          <li>No sobrecargar intencionalmente nuestra infraestructura.</li>
          <li>Obtener el consentimiento de tus clientes antes de almacenar sus datos personales en la plataforma.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Tus datos</h2>
        <p>
          Sos el propietario de los datos que cargás en MiAgenda (clientes, citas, servicios, gastos, etc.).
          Al eliminar tu cuenta desde el panel de configuración, todos tus datos —incluyendo los de tu negocio,
          empleados, citas y servicios— se eliminan de forma inmediata e irreversible de nuestros sistemas.
          Algunos registros de transacciones pueden conservarse por obligación legal.
        </p>
        <p>
          Consultá nuestra <a href="/privacy">Política de Privacidad</a> para más detalles sobre
          cómo tratamos tus datos personales.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Propiedad intelectual</h2>
        <p>
          El software, diseño, marca y contenidos de MiAgenda son propiedad de sus creadores y
          están protegidos por las leyes de propiedad intelectual vigentes en la República Oriental del Uruguay.
          Te otorgamos una licencia limitada, no exclusiva e intransferible para usar el servicio.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Limitación de responsabilidad</h2>
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
        <h2>9. Modificaciones</h2>
        <p>
          Podemos actualizar estos términos ocasionalmente. Te notificaremos por email con al menos
          15 días de anticipación ante cambios significativos. El uso continuado del servicio
          luego de la notificación implica aceptación de los nuevos términos.
        </p>
      </div>

      <div className="legal-section">
        <h2>10. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier
          disputa se someterá a la jurisdicción de los tribunales ordinarios de Montevideo,
          renunciando a cualquier otro fuero.
        </p>
      </div>

      <div className="legal-section">
        <h2>11. Contacto</h2>
        <p>
          Para consultas sobre estos términos escribinos a{' '}
          <a href="mailto:soporte@miagenda.app">soporte@miagenda.app</a>{' '}
          o visitá nuestra <a href="/contact">página de contacto</a>.
        </p>
      </div>
    </LegalLayout>
  );
}
