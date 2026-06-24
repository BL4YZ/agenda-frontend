import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LegalLayout from '@/components/legal/LegalLayout';

type Article = {
  title: string;
  date: string;
  tag: string;
  body: React.ReactNode;
};

const ARTICLES: Record<string, Article> = {

  'reducir-ausencias': {
    title: 'Cómo reducir ausencias sin perseguir a tus clientes',
    date: '10 de junio de 2026',
    tag: 'Consejos',
    body: (
      <>
        <p>Una ausencia es una hora de tu tiempo que no vas a recuperar. El turno que no podiste rellenar, el ingreso que no entra, el hueco en tu agenda que molesta. Y en la mayoría de los casos, el cliente no faltó porque quiso — simplemente se olvidó.</p>
        <p>La buena noticia es que los olvidos se pueden prevenir, y no requieren que vos llames a nadie.</p>

        <h2>Por qué se olvidan los clientes</h2>
        <p>Reservar un turno con una semana de anticipación implica que el cliente tiene que recordarlo durante siete días. La vida pasa, las notificaciones se acumulan, y el turno del jueves a las 17:30 desaparece entre reuniones y mandados.</p>
        <p>No es falta de respeto. Es simplemente cómo funciona la memoria cuando no hay un sistema de soporte.</p>

        <h2>Lo que hace Novu automáticamente</h2>
        <p>Cada vez que se confirma una reserva, el cliente recibe dos emails sin que vos hagas nada:</p>
        <ul>
          <li><strong>Confirmación inmediata:</strong> al reservar, le llega un email con el servicio, la fecha, la hora y el nombre del profesional. Tiene algo concreto donde mirar si duda.</li>
          <li><strong>Recordatorio 2 horas antes:</strong> cuando el turno está cerca, otro email le avisa que es hoy. No mañana, no la semana que viene — hoy.</li>
        </ul>
        <p>Dos horas es el tiempo suficiente para que el cliente reorganice su día si lo necesita, pero no tanto como para que se vuelva a olvidar.</p>

        <h2>Lo que podés sumar vos</h2>
        <p>Los recordatorios automáticos ya resuelven la mayoría del problema, pero hay dos cosas adicionales que reducen aún más las ausencias:</p>

        <h3>Pedí una seña al reservar</h3>
        <p>Cuando el cliente deja aunque sea una parte del pago al reservar, el turno pasa a tener un costo de cancelación real. No vienen más clientes que reservan sin pensarlo y no aparecen. Si cancelan con tiempo, podés devolver la seña. Si no avisan, la seña queda como compensación por tu tiempo perdido.</p>
        <p>Podés activar esto desde el panel de cada servicio en Novu, eligiendo el monto de la seña.</p>

        <h3>Tené una política de cancelación clara</h3>
        <p>Ponerla por escrito en tu página pública hace que el cliente sepa qué esperar. No tiene que ser agresiva — con "las cancelaciones con menos de 2 horas de anticipación no son reembolsables" ya alcanza para que tomen la reserva más en serio.</p>

        <h2>¿Cuánto impacta?</h2>
        <p>No hay un número universal, pero negocios que combinan recordatorios automáticos con seña obligatoria reportan una reducción de ausencias de entre el 50% y el 80%. El solo hecho de que el cliente reciba un email de confirmación hace que la reserva "exista" de otra forma en su mente.</p>

        <h2>En resumen</h2>
        <p>No necesitás llamar a cada cliente la noche anterior. Con los recordatorios automáticos de Novu y una política de cancelación razonable, las ausencias bajan solos. Vos seguís trabajando.</p>
      </>
    ),
  },

  'cobros-online': {
    title: 'Cobrar antes de que el cliente llegue: ¿seña o pago completo?',
    date: '28 de mayo de 2026',
    tag: 'Finanzas',
    body: (
      <>
        <p>Coordinar turnos sin cobrar nada por adelantado tiene un costo invisible: las cancelaciones de último momento, los que no aparecen, los que avisan media hora antes. Cada vez que eso pasa, perdés un turno que podrías haber dado a otra persona.</p>
        <p>Cobrar al momento de la reserva resuelve ese problema. Y con Novu y MercadoPago, se activa en minutos.</p>

        <h2>Dos formas de cobrar por adelantado</h2>

        <h3>Seña (depósito parcial)</h3>
        <p>El cliente paga un porcentaje del servicio al reservar — por ejemplo, el 30% o 50% — y el resto lo abona al llegar. Es la opción más flexible y la que genera menos fricción: el cliente no siente que está comprometiendo todo su dinero, pero sí tiene algo en juego.</p>
        <p>Cuándo conviene usarla: para servicios de más de una hora, clientes nuevos, o cuando querés reducir cancelaciones sin exigir el pago completo por adelantado.</p>

        <h3>Pago completo</h3>
        <p>El cliente paga el 100% al confirmar la reserva. El turno queda pagado y listo. Es la opción más cómoda para ambas partes: vos no tenés nada pendiente, y el cliente ya sabe que está todo arreglado.</p>
        <p>Cuándo conviene usarla: para servicios cortos con precio fijo, clientes frecuentes, o negocios con alta demanda donde el turno vale mucho.</p>

        <h2>También podés no cobrar nada online</h2>
        <p>Si preferís manejar los pagos en persona — efectivo o transferencia — también está contemplado. Podés configurar cada servicio sin cobro online y registrar los pagos manualmente desde el dashboard después de cada cita. Así igual llevás el control de ingresos en un solo lugar.</p>

        <h2>MercadoPago: sin pasos complicados</h2>
        <p>Novu se conecta con tu cuenta de MercadoPago. Una vez conectada, el cliente puede pagar con tarjeta de crédito, débito, dinero en cuenta o cualquier método disponible en MercadoPago en tu país. El dinero va directo a tu cuenta — Novu no interviene en la transferencia ni cobra comisión sobre los pagos.</p>

        <h2>El efecto en tu caja</h2>
        <p>Más allá de reducir ausencias, cobrar por adelantado mejora tu flujo de caja. En lugar de esperar a que el cliente aparezca para recibir el pago, el dinero entra cuando se confirma la reserva. Para negocios con agenda llena, eso puede significar recibir ingresos días o semanas antes de que el servicio se preste.</p>

        <h2>Por dónde empezar</h2>
        <p>Si nunca cobraste online, el primer paso es conectar MercadoPago desde la sección de Configuración en tu dashboard. Después podés activar la seña para uno o dos servicios y ver cómo reacciona tu clientela. La mayoría de los negocios que lo prueba no vuelve atrás.</p>
      </>
    ),
  },

  'pagina-publica': {
    title: '5 cosas que podés hacer hoy en tu página pública para conseguir más reservas',
    date: '15 de mayo de 2026',
    tag: 'Crecimiento',
    body: (
      <>
        <p>Tu página pública en Novu es más que un formulario de reservas. Es tu presencia online — el lugar donde un cliente que nunca te conoció decide si te da o no una oportunidad. Vale la pena tenerla bien configurada.</p>
        <p>Acá van cinco cosas concretas que podés hacer hoy, sin necesitar diseñador ni programador.</p>

        <h2>1. Subí una foto de portada real</h2>
        <p>La foto de portada es lo primero que ve cualquier visitante. Una imagen de tu local, de tu equipo trabajando o de un resultado de los servicios que ofrecés genera mucha más confianza que una imagen genérica o ninguna foto.</p>
        <p>No tiene que ser una producción profesional — una buena foto desde el celular con buena luz alcanza.</p>

        <h2>2. Completá la descripción del negocio</h2>
        <p>La sección "Sobre nosotros" te permite contar quién sos, qué hacés y por qué tu negocio vale la pena. No hace falta que sea largo — dos o tres párrafos bien escritos son más que suficientes.</p>
        <p>Contá desde cuándo estás, qué tipo de clientes atendés, cuál es tu especialidad. Es la diferencia entre una página fría y una que genera confianza antes de que el cliente reserve.</p>

        <h2>3. Activá y completá las reseñas</h2>
        <p>Las reseñas son el equivalente online del boca a boca. Un visitante que no te conoce va a confiar más en lo que dicen otros clientes que en lo que escribís vos mismo.</p>
        <p>Podés agregar reseñas manualmente desde el editor de tu página. Pediles a tus clientes frecuentes que te den una frase breve y publicala. Con tres o cuatro reseñas reales ya se nota la diferencia.</p>

        <h2>4. Respondé las preguntas más frecuentes</h2>
        <p>La sección de FAQs sirve para responder de antemano las dudas que frenan una reserva: ¿Hay estacionamiento? ¿Atienden sin turno? ¿Qué pasa si necesito cancelar? ¿Aceptan tarjeta?</p>
        <p>Cada pregunta respondida es una razón menos para que el cliente abandone la página sin reservar.</p>

        <h2>5. Compartí el link en todos lados</h2>
        <p>Tu página pública tiene una URL propia — algo como <em>novu.app/tu-negocio</em>. Esa URL la podés poner en tu bio de Instagram, en tu perfil de Google, en la firma de tus emails, en tus tarjetas de presentación.</p>
        <p>Cada lugar donde aparezca ese link es una puerta de entrada a tu agenda. Cuantas más puertas, más reservas.</p>

        <h2>Un bonus: elegí el tema que representa a tu negocio</h2>
        <p>Novu te ofrece distintos temas visuales para tu página pública. Elegir el que mejor refleja el estilo de tu negocio — más minimalista, más cálido, más profesional — hace que el cliente sienta coherencia antes de conocerte en persona.</p>
      </>
    ),
  },

  'metricas-negocio': {
    title: 'Las métricas que todo negocio de servicios debería mirar cada semana',
    date: '2 de mayo de 2026',
    tag: 'Finanzas',
    body: (
      <>
        <p>No hace falta ser contador ni tener un MBA para entender cómo va tu negocio. Hay cuatro o cinco números que, leídos bien, te dicen casi todo lo que necesitás saber.</p>
        <p>El problema es que muchos negocios trabajan a ciegas — saben que les va "bien" o "mal" por sensación, no por datos. Y la sensación engaña.</p>

        <h2>1. Ingresos del período</h2>
        <p>El número más básico: cuánto entraste en la semana, el mes o el año. No cuántas citas tuviste — cuánto dinero real ingresó.</p>
        <p>Mirarlo semana a semana te permite detectar tendencias antes de que sean un problema. Una caída de dos semanas seguidas es una señal de alerta. Un pico sostenido puede indicar que es momento de subir precios o incorporar personal.</p>

        <h2>2. Ticket promedio</h2>
        <p>Es el promedio que gastó cada cliente en una visita. Se calcula dividiendo los ingresos totales por la cantidad de citas.</p>
        <p>Si tu ticket promedio baja, puede significar que cada vez más clientes eligen tus servicios más baratos — o que dejaste de vender servicios complementarios. Si sube, algo estás haciendo bien.</p>

        <h2>3. Tasa de cobro</h2>
        <p>De todas las citas que tuviste, ¿qué porcentaje terminó pagada? Las citas "sin cobro" — donde el servicio se prestó pero no hubo pago — son un número que muchos negocios ignoran y que silenciosamente erosiona los ingresos.</p>
        <p>Una tasa de cobro baja puede indicar que tenés demasiados servicios gratuitos, favores que se acumulan o un sistema de cobro que no funciona.</p>

        <h2>4. Ocupación por horario</h2>
        <p>El mapa de calor de Novu muestra en qué días y horarios está más llena tu agenda. Esa información vale oro: sabés cuándo podés ofrecer descuentos para llenar los huecos, cuándo conviene agregar un profesional, y cuándo podés descansar sin perder mucho.</p>

        <h2>5. Clientes nuevos vs. recurrentes</h2>
        <p>Un negocio sano tiene un equilibrio: suficientes clientes nuevos para crecer, suficientes recurrentes para tener base estable. Si casi todos son nuevos, algo falla en la fidelización. Si casi todos son recurrentes y no entra nadie nuevo, el negocio está estancado.</p>

        <h2>Con qué frecuencia mirarlos</h2>
        <p>Los ingresos y la tasa de cobro conviene mirarlos semanalmente. El ticket promedio y la ocupación, mensualmente. Los clientes nuevos vs. recurrentes, una vez por mes es suficiente para detectar tendencias.</p>
        <p>En Novu podés ver todo esto desde la sección de Métricas, filtrado por el período que quieras. No necesitás exportar nada ni armar una planilla — está todo ahí.</p>
      </>
    ),
  },

  'agenda-vs-whatsapp': {
    title: 'Agenda online vs. WhatsApp: por qué dejar de coordinar por chat',
    date: '18 de abril de 2026',
    tag: 'Consejos',
    body: (
      <>
        <p>Empezás el día revisando veinte mensajes de WhatsApp para saber a quién atendés. Un cliente pregunta si hay lugar el martes, otro quiere cambiar el horario, otro directamente no confirmó y no sabés si viene o no.</p>
        <p>Esto le pasa a la mayoría de los negocios de servicios. Y parece cómodo hasta que no lo es más.</p>

        <h2>El problema de coordinar por chat</h2>
        <p>WhatsApp no es una agenda. Es un canal de comunicación que, usado como agenda, tiene problemas estructurales:</p>
        <ul>
          <li><strong>No hay confirmación automática.</strong> Acordaste con el cliente, pero ¿quedó confirmado? ¿Quedó en el historial? ¿Lo encontrás si necesitás buscarlo?</li>
          <li><strong>Los errores son fáciles.</strong> Dos clientes para el mismo horario. Un horario mal escrito. Un mensaje que no se leyó.</li>
          <li><strong>No escala.</strong> Con tres clientes por día funciona. Con veinte, se vuelve caótico.</li>
          <li><strong>Te quita tiempo fuera del trabajo.</strong> Los mensajes llegan a las 11 de la noche, el domingo, mientras estás comiendo.</li>
        </ul>

        <h2>Lo que cambia con una agenda online</h2>
        <p>Cuando el cliente reserva solo desde tu página pública, el intercambio de mensajes para coordinar desaparece. El cliente elige el horario disponible, confirma, paga si corresponde, y recibe la confirmación por email.</p>
        <p>Vos no intervenís. La cita aparece en tu calendario y listo.</p>

        <h2>¿Perdo la relación con el cliente?</h2>
        <p>Esta es la pregunta que más frena a los negocios. La respuesta es no. La relación con el cliente sucede en el servicio, no en la coordinación del turno. De hecho, muchos clientes prefieren poder reservar sin tener que esperar respuesta — hacerlo a su hora, desde donde estén, sin depender de que vos estés disponible.</p>

        <h2>La transición no tiene que ser abrupta</h2>
        <p>No hace falta que de un día para el otro le digas a todos tus clientes que ya no respondés por WhatsApp. Podés empezar compartiendo el link de tu página pública en los chats, con un mensaje simple: "Ahora podés reservar directo desde acá, sin esperar respuesta."</p>
        <p>La mayoría de los clientes adopta el sistema rápido — sobre todo los que reservan seguido y ya saben el proceso.</p>

        <h2>WhatsApp sigue siendo útil</h2>
        <p>Para comunicación puntual — avisarle a un cliente que llegás tarde, responder una consulta específica, dar información sobre un servicio nuevo — WhatsApp sigue siendo perfecto. Lo que cambia es que deja de ser el sistema de gestión de turnos, y pasa a ser lo que es: un canal de mensajería.</p>
      </>
    ),
  },

  'modalidades-compensacion': {
    title: 'Modalidades de compensación: ¿cuál le conviene a tu equipo?',
    date: '5 de abril de 2026',
    tag: 'Gestión',
    body: (
      <>
        <p>Cuando empezás a sumar personal, una de las primeras preguntas que aparece es cómo pagarles. No hay una sola respuesta correcta — depende del tipo de negocio, de la persona y de lo que ambos necesitan.</p>
        <p>Novu soporta cuatro modalidades. Acá van los pros y contras de cada una.</p>

        <h2>Sueldo fijo</h2>
        <p>El empleado recibe un monto fijo mensual, independientemente de cuántas citas haga.</p>
        <p><strong>Ventajas:</strong> predecible para los dos lados. El empleado tiene certeza de ingresos, vos podés proyectar costos. Genera más estabilidad y compromiso en personas que recién empiezan.</p>
        <p><strong>Desventajas:</strong> no hay incentivo directo para generar más trabajo. Si un mes tiene pocas citas, el costo es el mismo para vos.</p>
        <p><strong>Cuándo usar:</strong> empleados con rol fijo (recepción, asistencia), personas que recién empiezan, o cuando el volumen de citas es relativamente estable.</p>

        <h2>Comisión por cita</h2>
        <p>El empleado cobra un porcentaje de cada servicio que realiza — por ejemplo, el 50% del valor del turno.</p>
        <p><strong>Ventajas:</strong> alineás los incentivos: el empleado gana más si trabaja más. El costo laboral varía con los ingresos, lo que reduce el riesgo en meses flojos.</p>
        <p><strong>Desventajas:</strong> ingresos variables para el empleado, lo que puede generar inestabilidad. En meses malos, puede no alcanzar para cubrir sus necesidades.</p>
        <p><strong>Cuándo usar:</strong> profesionales con clientela propia, personas con experiencia que valoran la autonomía, o cuando querés crecer sin riesgo fijo alto.</p>

        <h2>Alquiler de silla (o de espacio)</h2>
        <p>El profesional te paga un monto fijo mensual por usar el espacio y opera de forma independiente — sus clientes, sus precios, sus horarios.</p>
        <p><strong>Ventajas:</strong> para vos, ingreso fijo garantizado sin importar cuánto trabaje el profesional. Para el profesional, total autonomía.</p>
        <p><strong>Desventajas:</strong> el profesional no es tu empleado — no podés pedirle que atienda según tus criterios. Si se va, perdés ese ingreso fijo de golpe.</p>
        <p><strong>Cuándo usar:</strong> cuando tenés espacio físico disponible y querés monetizarlo sin sumarte la gestión de más personal.</p>

        <h2>Modalidad mixta</h2>
        <p>Combinación de sueldo base más comisión. Por ejemplo, un monto fijo que cubre lo básico más un porcentaje por cita.</p>
        <p><strong>Ventajas:</strong> equilibrio entre estabilidad para el empleado e incentivo de productividad. Es la modalidad que mejor funciona en muchos negocios de servicios.</p>
        <p><strong>Desventajas:</strong> más compleja de administrar y de explicar. Requiere dejar todo muy claro por escrito desde el inicio.</p>
        <p><strong>Cuándo usar:</strong> empleados con cierta experiencia que valoran tanto la estabilidad como la posibilidad de ganar más.</p>

        <h2>Cómo lo maneja Novu</h2>
        <p>Podés configurar la modalidad de cada integrante del equipo desde la sección de Equipo. El sistema calcula automáticamente las comisiones en base a las citas registradas y las muestra en el historial de pagos, listas para liquidar.</p>
      </>
    ),
  },

  'temporada-alta': {
    title: 'Cómo preparar tu negocio para la temporada alta',
    date: '20 de marzo de 2026',
    tag: 'Gestión',
    body: (
      <>
        <p>Hay momentos del año donde la demanda se multiplica: fin de año, semana santa, vacaciones de julio, el día de la madre. Para algunos negocios, esas semanas representan el 30% de los ingresos anuales.</p>
        <p>El problema es que cuando llega el pico, no hay tiempo para prepararse. Hay que hacerlo antes.</p>

        <h2>Definí tu capacidad máxima real</h2>
        <p>Antes de abrir la agenda, calculá cuántas citas podés atender por día sin que la calidad baje. Tener la agenda llena al 120% no es un éxito — es una receta para que los clientes queden mal atendidos y no vuelvan.</p>
        <p>En Novu podés ver el historial de citas de temporadas anteriores para tener una referencia real.</p>

        <h2>Actualizá los horarios con anticipación</h2>
        <p>Si en temporada alta vas a abrir más temprano, cerrar más tarde o trabajar algún día que habitualmente no trabajás, configuralo en Novu antes de que empiece. Así la disponibilidad que ven los clientes es la correcta desde el primer momento.</p>

        <h2>Activá las señas si no las tenés activas</h2>
        <p>En temporada alta, los no-shows y las cancelaciones de último momento duelen más porque la agenda está llena y reemplazar ese turno es más difícil. Una seña obligatoria al reservar reduce ese riesgo.</p>

        <h2>Comunicá con anticipación</h2>
        <p>Compartí el link de tu página pública en tus redes antes de que empiece la temporada. Muchos clientes buscan turno con días o semanas de anticipación — si no encontraron lugar con vos, buscan con otro. Llegar primero importa.</p>

        <h2>Definí hasta cuándo podés tomar reservas</h2>
        <p>En períodos de alta demanda puede convenir cerrar la agenda después de cierto punto — no tiene sentido seguir mostrando disponibilidad si no podés atender bien. Podés bloquear horarios en Novu para que no aparezcan como disponibles aunque técnicamente estén libres.</p>

        <h2>Después del pico, revisá los números</h2>
        <p>Una vez que pasa la temporada, mirá las métricas: qué días fueron los más ocupados, cuánto ingresaste, qué servicios se pidieron más. Esa información te sirve para preparar mejor la siguiente temporada — y para saber si tiene sentido incorporar personal o ampliar horarios de forma permanente.</p>
      </>
    ),
  },

  'precios-servicios': {
    title: 'Precios de servicios: cómo saber si estás cobrando bien',
    date: '5 de marzo de 2026',
    tag: 'Finanzas',
    body: (
      <>
        <p>Muchos negocios fijan sus precios mirando qué cobra la competencia y poniéndose "más o menos en ese rango". El problema es que ese rango puede no tener nada que ver con lo que a vos te cuesta prestar el servicio.</p>
        <p>Cobrar bien no es cobrar caro — es cobrar lo que corresponde para que el negocio sea sustentable y siga creciendo.</p>

        <h2>El error más común: ignorar el costo real</h2>
        <p>El precio de un servicio tiene que cubrir, como mínimo:</p>
        <ul>
          <li>El costo de los insumos usados</li>
          <li>La parte proporcional del alquiler y servicios</li>
          <li>La compensación del profesional que lo realiza</li>
          <li>Un margen para el negocio</li>
        </ul>
        <p>Si no calculaste eso en algún momento, es probable que algunos servicios estén dando menos ganancia de lo que creés — o directamente perdiendo dinero.</p>

        <h2>El tiempo es un costo</h2>
        <p>Un servicio de 30 minutos no vale la mitad que uno de 60 minutos solo por el tiempo. El tiempo tiene un costo: es tiempo que no podés usar para atender a otro cliente. Si tu agenda está llena, cada turno tiene que justificar haber ocupado ese espacio.</p>

        <h2>Cómo usar las métricas para revisar precios</h2>
        <p>En Novu podés ver cuántos ingresos genera cada servicio. Si tenés un servicio que se pide mucho pero genera pocos ingresos, puede ser una señal de que está subpreciado. Si uno se pide poco pero genera bien, puede ser que el precio lo esté frenando — o que simplemente no haya demanda.</p>
        <p>También conviene mirar el ticket promedio histórico. Si lleva varios meses estancado y tus costos subieron, probablemente necesitás actualizar precios.</p>

        <h2>Subir precios sin perder clientes</h2>
        <p>El miedo a subir precios es real, pero generalmente el impacto es menor de lo que se espera. Algunas formas de hacerlo con menos fricción:</p>
        <ul>
          <li>Hacelo gradualmente, no de golpe.</li>
          <li>Comunicalo con anticipación — los clientes que ya tienen turno agendado lo mantienen al precio anterior.</li>
          <li>Acompañá la suba con alguna mejora visible: un nuevo servicio, mejor equipamiento, cambio en el local.</li>
        </ul>

        <h2>El precio también comunica</h2>
        <p>Ser el más barato del mercado no siempre es una ventaja. Hay clientes que asocian precio bajo con calidad baja. Un precio justo, bien comunicado con una buena página pública y buenas reseñas, atrae mejor perfil de cliente que reventar precios para llenar la agenda.</p>

        <h2>Revisá los precios al menos una vez por año</h2>
        <p>Los costos cambian — insumos, alquiler, inflación. Lo que era rentable el año pasado puede no serlo hoy. Revisá los precios de todos tus servicios al menos una vez por año y ajustá los que lo necesiten.</p>
      </>
    ),
  },

};

export async function generateStaticParams() {
  return Object.keys(ARTICLES).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) return { title: 'Blog — Novu' };
  return { title: `${article.title} — Novu` };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();

  return (
    <LegalLayout title={article.title} lastUpdated={article.date}>
      <div style={{ marginBottom: 24 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
          background: 'rgba(167,139,250,.15)', color: '#a78bfa',
        }}>
          {article.tag}
        </span>
      </div>
      <div className="legal-section" style={{ lineHeight: 1.8 }}>
        {article.body}
      </div>
    </LegalLayout>
  );
}
