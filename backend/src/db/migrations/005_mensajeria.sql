-- ════════════════════════════════════════════════════════════════════
-- Migración 005 — Mensajería dentro de una postulación (v3.0)
-- La "conversación" es la propia postulación: candidato ↔ empleador dueño
-- de la oferta intercambian mensajes para coordinar el proceso.
-- ════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS mensajes (
  id_mensaje     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_postulacion INT UNSIGNED NOT NULL,
  id_remitente   INT UNSIGNED NOT NULL,
  cuerpo         VARCHAR(2000) NOT NULL,
  leido          TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_envio    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_mensaje),
  KEY idx_mensajes_postulacion (id_postulacion, fecha_envio),
  KEY idx_mensajes_remitente (id_remitente),
  CONSTRAINT fk_mensajes_postulacion FOREIGN KEY (id_postulacion)
    REFERENCES postulaciones (id_postulacion) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_mensajes_remitente FOREIGN KEY (id_remitente)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
