import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../../config/env';
import { logger } from '../../config/logger';

/**
 * Servicio de correo transaccional (nodemailer).
 *
 * - Con SMTP configurado (SMTP_HOST): envía de verdad.
 * - Sin SMTP en desarrollo: usa un transporte JSON y registra el correo en el
 *   log, de modo que el flujo funciona sin servidor de correo.
 * - En test: no hace nada.
 *
 * Todos los envíos son "best-effort": un fallo se registra pero NUNCA rompe la
 * operación de negocio que disparó el correo.
 */
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  if (config.smtp.host) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

interface Mail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/** Envuelve el contenido en una plantilla HTML sencilla con la identidad verde. */
function layout(titulo: string, cuerpo: string): string {
  return `<!doctype html><html lang="es"><body style="margin:0;background:#f1f8f1;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <h1 style="color:#2e7d32;font-size:20px">Corredor Empleo</h1>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px">
        <h2 style="font-size:18px;margin-top:0">${titulo}</h2>
        ${cuerpo}
      </div>
      <p style="color:#6b7280;font-size:12px;margin-top:16px">
        Plataforma de Empleo del Corredor Ecológico · Villavicencio
      </p>
    </div>
  </body></html>`;
}

function boton(href: string, texto: string): string {
  return `<p style="margin:20px 0"><a href="${href}" style="background:#2e7d32;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block">${texto}</a></p>`;
}

async function send(mail: Mail): Promise<void> {
  if (config.isTest) return;
  try {
    await getTransporter().sendMail({ from: config.smtp.from, ...mail });
    if (!config.smtp.host) {
      logger.info(
        { to: mail.to, subject: mail.subject },
        'Correo simulado (sin SMTP configurado): no se envió, solo se registró',
      );
    }
  } catch (error) {
    logger.error({ err: error, to: mail.to, subject: mail.subject }, 'No se pudo enviar el correo');
  }
}

export function sendWelcome(to: string, nombre: string): Promise<void> {
  return send({
    to,
    subject: '¡Bienvenido/a a Corredor Empleo!',
    html: layout(
      `Hola, ${nombre}`,
      `<p>Tu cuenta se creó correctamente. Ya puedes explorar ofertas, postularte y gestionar tu perfil.</p>
       ${boton(`${config.appUrl}/ofertas`, 'Explorar ofertas')}`,
    ),
  });
}

export function sendPasswordReset(to: string, nombre: string, enlace: string): Promise<void> {
  return send({
    to,
    subject: 'Restablece tu contraseña',
    html: layout(
      `Hola, ${nombre}`,
      `<p>Recibimos una solicitud para restablecer tu contraseña. El enlace caduca en 1 hora.</p>
       ${boton(enlace, 'Restablecer contraseña')}
       <p style="color:#6b7280;font-size:13px">Si no fuiste tú, ignora este correo.</p>`,
    ),
  });
}

export function sendNewApplication(
  to: string,
  empleador: string,
  tituloOferta: string,
  enlace: string,
): Promise<void> {
  return send({
    to,
    subject: `Nueva postulación a "${tituloOferta}"`,
    html: layout(
      `Hola, ${empleador}`,
      `<p>Recibiste una nueva postulación para tu oferta <strong>${tituloOferta}</strong>.</p>
       ${boton(`${config.appUrl}${enlace}`, 'Ver postulantes')}`,
    ),
  });
}

export function sendStatusChange(
  to: string,
  candidato: string,
  tituloOferta: string,
  estado: string,
): Promise<void> {
  return send({
    to,
    subject: `Actualización de tu postulación a "${tituloOferta}"`,
    html: layout(
      `Hola, ${candidato}`,
      `<p>El estado de tu postulación a <strong>${tituloOferta}</strong> cambió a: <strong>${estado}</strong>.</p>
       ${boton(`${config.appUrl}/candidato/postulaciones`, 'Ver mis postulaciones')}`,
    ),
  });
}

export function sendJobAlert(
  to: string,
  nombre: string,
  tituloOferta: string,
  ofertaId: number,
): Promise<void> {
  return send({
    to,
    subject: `Nueva oferta que coincide con tu alerta: ${tituloOferta}`,
    html: layout(
      `Hola, ${nombre}`,
      `<p>Se publicó una oferta que coincide con una de tus alertas: <strong>${tituloOferta}</strong>.</p>
       ${boton(`${config.appUrl}/ofertas/${ofertaId}`, 'Ver oferta')}`,
    ),
  });
}
