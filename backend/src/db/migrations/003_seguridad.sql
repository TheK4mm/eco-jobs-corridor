-- ════════════════════════════════════════════════════════════════════
-- Migración 003 — Seguridad y trazabilidad (v3.0)
--   · Refresh tokens con rotación y detección de reuso (tokens_sesion)
--   · Recuperación de contraseña de un solo uso (tokens_recuperacion)
--   · Registro de auditoría de acciones sensibles (auditoria)
--   · Borrado lógico (deleted_at) en usuarios y ofertas
--   · Bloqueo de cuenta por intentos fallidos de login
-- ════════════════════════════════════════════════════════════════════

-- Usuarios: bloqueo por fuerza bruta + borrado lógico ───────────────────
ALTER TABLE usuarios
  ADD COLUMN intentos_fallidos TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER activo,
  ADD COLUMN bloqueado_hasta   DATETIME  NULL DEFAULT NULL AFTER intentos_fallidos,
  ADD COLUMN deleted_at        TIMESTAMP NULL DEFAULT NULL AFTER fecha_actualizacion,
  ADD KEY idx_usuarios_deleted (deleted_at);

-- Ofertas: borrado lógico ───────────────────────────────────────────────
ALTER TABLE ofertas
  ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER fecha_actualizacion,
  ADD KEY idx_ofertas_deleted (deleted_at);

-- Refresh tokens de sesión (se guarda solo el hash sha256) ───────────────
-- La rotación marca `revocado=1` y enlaza `reemplazado_por`; si llega un
-- token ya revocado se asume reuso (robo) y se revoca toda la familia.
CREATE TABLE IF NOT EXISTS tokens_sesion (
  id_token        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario      INT UNSIGNED NOT NULL,
  token_hash      CHAR(64)     NOT NULL,
  expira_en       DATETIME     NOT NULL,
  revocado        TINYINT(1)   NOT NULL DEFAULT 0,
  reemplazado_por INT UNSIGNED NULL,
  user_agent      VARCHAR(255) NULL,
  ip              VARCHAR(45)  NULL,
  fecha_creacion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_token),
  UNIQUE KEY uq_tokens_sesion_hash (token_hash),
  KEY idx_tokens_sesion_usuario (id_usuario, revocado),
  CONSTRAINT fk_tokens_sesion_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tokens de recuperación de contraseña (hash, un solo uso) ───────────────
CREATE TABLE IF NOT EXISTS tokens_recuperacion (
  id_token       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario     INT UNSIGNED NOT NULL,
  token_hash     CHAR(64)     NOT NULL,
  expira_en      DATETIME     NOT NULL,
  usado          TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_token),
  UNIQUE KEY uq_tokens_recup_hash (token_hash),
  KEY idx_tokens_recup_usuario (id_usuario),
  CONSTRAINT fk_tokens_recup_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Auditoría de acciones sensibles (quién, qué, cuándo) ───────────────────
CREATE TABLE IF NOT EXISTS auditoria (
  id_evento   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_actor    INT UNSIGNED NULL,
  accion      VARCHAR(60)  NOT NULL,
  entidad     VARCHAR(40)  NOT NULL,
  id_entidad  INT UNSIGNED NULL,
  detalle     JSON         NULL,
  ip          VARCHAR(45)  NULL,
  fecha       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evento),
  KEY idx_auditoria_entidad (entidad, id_entidad),
  KEY idx_auditoria_actor (id_actor),
  KEY idx_auditoria_fecha (fecha),
  CONSTRAINT fk_auditoria_actor FOREIGN KEY (id_actor)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
