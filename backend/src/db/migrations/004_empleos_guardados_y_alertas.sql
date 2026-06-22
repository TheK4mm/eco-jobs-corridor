-- ════════════════════════════════════════════════════════════════════
-- Migración 004 — Empleos guardados y alertas de empleo (v3.0)
--   · empleos_guardados: ofertas marcadas como favoritas por un candidato
--   · alertas_empleo: criterios para notificar nuevas ofertas que coincidan
-- ════════════════════════════════════════════════════════════════════

-- Favoritos: relación M:N candidato ↔ oferta ────────────────────────────
CREATE TABLE IF NOT EXISTS empleos_guardados (
  id_usuario     INT UNSIGNED NOT NULL,
  id_oferta      INT UNSIGNED NOT NULL,
  fecha_guardado TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_oferta),
  KEY idx_guardados_oferta (id_oferta),
  CONSTRAINT fk_guardados_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_guardados_oferta FOREIGN KEY (id_oferta)
    REFERENCES ofertas (id_oferta) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alertas de empleo: criterios de notificación de un candidato ───────────
CREATE TABLE IF NOT EXISTS alertas_empleo (
  id_alerta      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario     INT UNSIGNED NOT NULL,
  palabra_clave  VARCHAR(120) NULL,
  id_categoria   INT UNSIGNED NULL,
  modalidad      ENUM('presencial','remoto','hibrido') NULL,
  activa         TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_alerta),
  KEY idx_alertas_usuario (id_usuario, activa),
  CONSTRAINT fk_alertas_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_alertas_categoria FOREIGN KEY (id_categoria)
    REFERENCES categorias (id_categoria) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
