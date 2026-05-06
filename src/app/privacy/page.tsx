import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = { title: 'Política de Privacidad — MiAgenda' };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="6 de mayo de 2026">
      <div className="legal-highlight">
        Tu privacidad es importante para nosotros. Esta política explica qué datos recopilamos,
        cómo los usamos y cuáles son tus derechos, conforme a la Ley 18.331 de Protección de
        Datos Personales de la República Oriental del Uruguay.
      </div>

      <div className="legal-section">
        <h2>1. Responsable del tratamiento</h2>
        <p>
          El responsable del tratamiento de tus datos personales es <strong>MiAgenda</strong>,
          con domicilio en la República Oriental del Uruguay. Para cualquier consulta sobre privacidad
          contactanos en <a href="mailto:privacidad@miagenda.app">privacidad@miagenda.app</a>.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Datos que recopilamos</h2>

        <h3>Al crear tu cuenta</h3>
        <ul>
          <li>Dirección de email y contraseña (almacenada con hash bcrypt, nunca en texto plano).</li>
          <li>Si te registrás con Google: nombre, email e identificador de cuenta provistos por Google.</li>
        </ul>

        <h3>Al configurar tu negocio</h3>
        <ul>
          <li>Nombre del negocio, descripción, logo, dirección y datos de contacto.</li>
          <li>Servicios ofrecidos: nombre, duración, precio y modalidad.</li>
          <li>Sucursales: nombre y dirección de cada sede.</li>
          <li>Horarios de atención por empleado y sucursal.</li>
        </ul>

        <h3>Durante el uso del servicio</h3>
        <ul>
          <li>Datos de citas: fecha, hora, servicio, cliente, empleado asignado y estado de pago.</li>
          <li>Datos de clientes que agendaron turnos: nombre, teléfono, email y notas.</li>
          <li>Datos de empleados invitados: nombre, email y permisos asignados.</li>
          <li>Datos de gastos: monto, categoría, descripción y fecha (plan Pro).</li>
          <li>Datos de comisiones: porcentaje por servicio por empleado (plan Pro).</li>
          <li>Datos de conexión con Mercado Pago: tokens de acceso OAuth almacenados cifrados con AES-256-GCM.</li>
        </ul>

        <h3>Automáticamente</h3>
        <ul>
          <li>Dirección IP y tipo de navegador en cada solicitud.</li>
          <li>Registros de errores para diagnóstico técnico.</li>
          <li>Métricas de uso agregadas (cantidad de citas, ingresos totales) para el panel de analytics.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Cómo usamos tus datos</h2>
        <ul>
          <li><strong>Prestación del servicio:</strong> gestionar tu agenda, citas, empleados, servicios y configuraciones.</li>
          <li><strong>Página pública de reservas:</strong> mostrar tu disponibilidad a clientes que quieran agendar un turno.</li>
          <li><strong>Recordatorios automáticos:</strong> enviar emails de recordatorio a tus clientes 24 horas antes de su turno.</li>
          <li><strong>Facturación:</strong> procesar pagos y gestionar tu suscripción a través de Mercado Pago.</li>
          <li><strong>Soporte:</strong> responder tus consultas y resolver problemas técnicos.</li>
          <li><strong>Mejora del producto:</strong> analizar el uso agregado y anónimo para mejorar la plataforma.</li>
        </ul>
        <p>No vendemos ni alquilamos tus datos a terceros bajo ninguna circunstancia.</p>
      </div>

      <div className="legal-section">
        <h2>4. Terceros que acceden a tus datos</h2>
        <ul>
          <li>
            <strong>Mercado Pago</strong> — procesamiento de pagos y suscripciones. Al conectar tu cuenta de
            Mercado Pago para recibir cobros, almacenamos el token de acceso OAuth de forma cifrada (AES-256-GCM).
            Las transacciones se rigen por la{' '}
            <a href="https://www.mercadopago.com.ar/privacidad" target="_blank" rel="noopener noreferrer">
              política de privacidad de Mercado Pago
            </a>.
          </li>
          <li>
            <strong>Google</strong> — autenticación OAuth (si usás "Continuar con Google").
            Solo recibimos tu nombre, email e identificador de cuenta. No accedemos a otros datos de tu cuenta de Google.
            Política:{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              policies.google.com/privacy
            </a>.
          </li>
          <li>
            <strong>Resend</strong> — envío de emails transaccionales (verificación de cuenta, recuperación de contraseña,
            recordatorios de citas). Solo reciben el destinatario y el contenido del email necesario para cada envío.
          </li>
          <li>
            <strong>Railway</strong> — infraestructura de hosting donde se ejecutan los servidores de MiAgenda
            y se aloja la base de datos. Actúa como encargado del tratamiento y está contractualmente obligado
            a proteger los datos. Política:{' '}
            <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer">
              railway.app/legal/privacy
            </a>.
          </li>
        </ul>
        <p>
          Todos los terceros están contractualmente obligados a tratar tus datos únicamente
          para los fines indicados y con medidas de seguridad adecuadas.
        </p>
      </div>

      <div className="legal-section">
        <h2>5. Almacenamiento y seguridad</h2>
        <ul>
          <li>Tus datos se almacenan en la infraestructura de Railway (servidores en la nube).</li>
          <li>Las contraseñas se almacenan con hash bcrypt (factor de trabajo 10); nunca en texto plano.</li>
          <li>Los tokens OAuth de Mercado Pago se almacenan cifrados con AES-256-GCM.</li>
          <li>Todas las comunicaciones entre tu navegador y nuestros servidores usan HTTPS/TLS.</li>
          <li>El acceso a la base de datos está restringido y protegido por credenciales únicas.</li>
          <li>Implementamos limitación de intentos de inicio de sesión para prevenir accesos no autorizados.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Retención y eliminación de datos</h2>
        <p>
          Conservamos tus datos mientras tengas una cuenta activa. Al eliminar tu cuenta desde el panel
          de configuración, todos tus datos —incluyendo los de tu negocio, empleados, citas, servicios,
          gastos y comisiones— se eliminan de forma inmediata e irreversible de nuestros sistemas mediante
          una operación atómica. Los empleados invitados que no tengan su propio negocio quedan desvinculados.
        </p>
        <p>
          Ciertos registros de transacciones pueden conservarse por el período que exija la normativa
          fiscal y contable aplicable.
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Tus derechos</h2>
        <p>
          Conforme a la Ley 18.331 de Protección de Datos Personales (Uruguay) y normas concordantes, tenés derecho a:
        </p>
        <ul>
          <li><strong>Acceso:</strong> solicitar una copia de los datos que tenemos sobre vos.</li>
          <li><strong>Rectificación:</strong> corregir datos incorrectos o incompletos desde el panel de configuración.</li>
          <li><strong>Eliminación:</strong> borrar tu cuenta y todos tus datos directamente desde Configuración → Eliminar cuenta.</li>
          <li><strong>Portabilidad:</strong> exportar tus datos en formato estructurado.</li>
          <li><strong>Oposición:</strong> oponerte al uso de tus datos para fines distintos a los del servicio.</li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos escribinos a{' '}
          <a href="mailto:privacidad@miagenda.app">privacidad@miagenda.app</a>.
          Responderemos en un plazo máximo de 15 días hábiles.
        </p>
      </div>

      <div className="legal-section">
        <h2>8. Cookies</h2>
        <p>
          MiAgenda utiliza únicamente cookies técnicas estrictamente necesarias para el
          funcionamiento de la sesión (token de autenticación JWT almacenado en <code>localStorage</code>).
          No usamos cookies de seguimiento, publicidad ni analítica de terceros.
        </p>
      </div>

      <div className="legal-section">
        <h2>9. Menores de edad</h2>
        <p>
          El servicio está dirigido a mayores de 18 años. No recopilamos intencionalmente
          datos de menores. Si creés que un menor ha creado una cuenta, contactanos para eliminarla.
        </p>
      </div>

      <div className="legal-section">
        <h2>10. Cambios a esta política</h2>
        <p>
          Podemos actualizar esta política ocasionalmente. Te notificaremos por email ante
          cambios significativos con al menos 15 días de anticipación. La fecha de "última
          actualización" al inicio del documento siempre refleja la versión vigente.
        </p>
      </div>

      <div className="legal-section">
        <h2>11. Contacto</h2>
        <p>
          Consultas sobre privacidad:{' '}
          <a href="mailto:privacidad@miagenda.app">privacidad@miagenda.app</a>
          <br />
          Consultas generales:{' '}
          <a href="mailto:soporte@miagenda.app">soporte@miagenda.app</a>
          <br />
          También podés contactarnos a través de nuestra <a href="/contact">página de contacto</a>.
        </p>
      </div>
    </LegalLayout>
  );
}
