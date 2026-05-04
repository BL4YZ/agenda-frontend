import LegalLayout from '@/components/legal/LegalLayout';

export const metadata = { title: 'Política de Privacidad — MiAgenda' };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="27 de abril de 2026">
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
          <li>Nombre del negocio</li>
          <li>Dirección de email</li>
          <li>Contraseña (almacenada con hash bcrypt, nunca en texto plano)</li>
          <li>Si te registrás con Google: nombre, email y foto de perfil provistos por Google</li>
        </ul>

        <h3>Durante el uso del servicio</h3>
        <ul>
          <li>Datos de citas: fecha, hora, servicio, cliente, empleado asignado</li>
          <li>Datos de clientes: nombre, teléfono, email, notas</li>
          <li>Datos de tu negocio: servicios, precios, horarios, sucursales</li>
          <li>Datos de facturación procesados por Mercado Pago (no los almacenamos directamente)</li>
        </ul>

        <h3>Automáticamente</h3>
        <ul>
          <li>Dirección IP y tipo de navegador</li>
          <li>Páginas visitadas dentro de la aplicación y tiempo de uso</li>
          <li>Registros de errores para diagnóstico técnico</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Cómo usamos tus datos</h2>
        <ul>
          <li><strong>Prestación del servicio:</strong> gestionar tu agenda, citas y configuraciones.</li>
          <li><strong>Comunicaciones:</strong> enviarte recordatorios de citas, notificaciones del sistema y actualizaciones importantes.</li>
          <li><strong>Facturación:</strong> procesar pagos y gestionar tu suscripción.</li>
          <li><strong>Soporte:</strong> responder tus consultas y resolver problemas técnicos.</li>
          <li><strong>Mejora del producto:</strong> analizar el uso agregado y anónimo para mejorar la plataforma.</li>
        </ul>
        <p>No vendemos ni alquilamos tus datos a terceros bajo ninguna circunstancia.</p>
      </div>

      <div className="legal-section">
        <h2>4. Terceros que acceden a tus datos</h2>
        <ul>
          <li>
            <strong>Mercado Pago</strong> — procesamiento de pagos. Sus transacciones se rigen
            por la <a href="https://www.mercadopago.com.ar/privacidad" target="_blank" rel="noopener noreferrer">política de privacidad de Mercado Pago</a>.
          </li>
          <li>
            <strong>Google</strong> — autenticación OAuth (si usás "Continuar con Google").
            Solo recibimos tu nombre, email y foto de perfil público. Política:&nbsp;
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>.
          </li>
          <li>
            <strong>Resend</strong> — envío de emails transaccionales (recordatorios, recuperación de contraseña).
            Solo reciben el destinatario y el contenido del email.
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
          <li>Tus datos se almacenan en servidores ubicados en Uruguay o la región de Latinoamérica.</li>
          <li>Las contraseñas se almacenan con hash bcrypt (factor de trabajo 10).</li>
          <li>Las comunicaciones entre tu navegador y nuestros servidores se realizan mediante HTTPS/TLS.</li>
          <li>El acceso a la base de datos está restringido y monitoreado.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>6. Retención de datos</h2>
        <p>
          Conservamos tus datos mientras tengas una cuenta activa. Al eliminar tu cuenta,
          tus datos se borran permanentemente en un plazo máximo de 30 días, excepto cuando
          la ley nos obligue a conservarlos por más tiempo (ej. registros de transacciones).
        </p>
      </div>

      <div className="legal-section">
        <h2>7. Tus derechos</h2>
        <p>
          Conforme a la Ley 18.331 de Protección de Datos Personales (Uruguay) y normas concordantes, tenés derecho a:
        </p>
        <ul>
          <li><strong>Acceso:</strong> solicitar una copia de los datos que tenemos sobre vos.</li>
          <li><strong>Rectificación:</strong> corregir datos incorrectos o incompletos.</li>
          <li><strong>Eliminación:</strong> solicitar el borrado de tus datos personales.</li>
          <li><strong>Portabilidad:</strong> exportar tus datos en formato estructurado (disponible desde el panel de configuración).</li>
          <li><strong>Oposición:</strong> oponerte al uso de tus datos para fines de marketing.</li>
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
          funcionamiento de la sesión. No usamos cookies de seguimiento ni publicidad de terceros.
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
        </p>
      </div>
    </LegalLayout>
  );
}
