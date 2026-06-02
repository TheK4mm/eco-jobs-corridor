-- ════════════════════════════════════════════════════════════════════
-- Migración 001 — Esquema inicial (normalizado, 3FN)
-- Plataforma de Empleo del Corredor Ecológico
-- Motor InnoDB (claves foráneas + transacciones), charset utf8mb4.
-- ════════════════════════════════════════════════════════════════════

-- Tabla de roles (catálogo) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id_rol       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(20)  NOT NULL,
  descripcion  VARCHAR(150) NULL,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_roles_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuarios ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre               VARCHAR(120) NOT NULL,
  email                VARCHAR(160) NOT NULL,
  contrasena_hash      VARCHAR(255) NOT NULL,
  id_rol               INT UNSIGNED NOT NULL,
  activo               TINYINT(1)   NOT NULL DEFAULT 1,
  fecha_registro       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_email (email),
  KEY idx_usuarios_rol (id_rol),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (id_rol)
    REFERENCES roles (id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Perfil de candidato (1:1 con usuario) ────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles_candidato (
  id_perfil           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario          INT UNSIGNED NOT NULL,
  telefono            VARCHAR(30)  NULL,
  titulo_profesional  VARCHAR(150) NULL,
  resumen             TEXT         NULL,
  ubicacion           VARCHAR(120) NULL,
  experiencia_anios   TINYINT UNSIGNED NULL,
  url_cv              VARCHAR(255) NULL,
  PRIMARY KEY (id_perfil),
  UNIQUE KEY uq_perfilcand_usuario (id_usuario),
  CONSTRAINT fk_perfilcand_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Perfil de empleador (1:1 con usuario) ────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles_empleador (
  id_perfil       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario      INT UNSIGNED NOT NULL,
  nombre_empresa  VARCHAR(150) NOT NULL,
  sector          VARCHAR(100) NULL,
  descripcion     TEXT         NULL,
  sitio_web       VARCHAR(200) NULL,
  ubicacion       VARCHAR(120) NULL,
  telefono        VARCHAR(30)  NULL,
  logo_url        VARCHAR(255) NULL,
  PRIMARY KEY (id_perfil),
  UNIQUE KEY uq_perfilemp_usuario (id_usuario),
  CONSTRAINT fk_perfilemp_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Habilidades (catálogo) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habilidades (
  id_habilidad INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(60)  NOT NULL,
  PRIMARY KEY (id_habilidad),
  UNIQUE KEY uq_habilidades_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación M:N candidato ↔ habilidades ─────────────────────────────────
CREATE TABLE IF NOT EXISTS candidato_habilidades (
  id_usuario   INT UNSIGNED NOT NULL,
  id_habilidad INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_usuario, id_habilidad),
  KEY idx_ch_habilidad (id_habilidad),
  CONSTRAINT fk_ch_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ch_habilidad FOREIGN KEY (id_habilidad)
    REFERENCES habilidades (id_habilidad) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorías de empleo (catálogo) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(80)  NOT NULL,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uq_categorias_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ofertas de empleo ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ofertas (
  id_oferta            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_empleador         INT UNSIGNED NOT NULL,
  id_categoria         INT UNSIGNED NULL,
  titulo               VARCHAR(160) NOT NULL,
  descripcion          TEXT         NOT NULL,
  empresa              VARCHAR(150) NULL,
  ubicacion            VARCHAR(120) NOT NULL DEFAULT 'Corredor Ecológico',
  modalidad            ENUM('presencial','remoto','hibrido') NOT NULL DEFAULT 'presencial',
  tipo_contrato        ENUM('tiempo_completo','medio_tiempo','temporal','practica','freelance')
                         NOT NULL DEFAULT 'tiempo_completo',
  salario_min          DECIMAL(12,2) NULL,
  salario_max          DECIMAL(12,2) NULL,
  estado               ENUM('activa','cerrada','borrador') NOT NULL DEFAULT 'activa',
  fecha_publicacion    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre         DATE         NULL,
  fecha_actualizacion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_oferta),
  KEY idx_ofertas_empleador (id_empleador),
  KEY idx_ofertas_categoria (id_categoria),
  KEY idx_ofertas_estado (estado),
  KEY idx_ofertas_fecha (fecha_publicacion),
  FULLTEXT KEY ft_ofertas (titulo, descripcion),
  CONSTRAINT fk_ofertas_empleador FOREIGN KEY (id_empleador)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ofertas_categoria FOREIGN KEY (id_categoria)
    REFERENCES categorias (id_categoria) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Postulaciones ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS postulaciones (
  id_postulacion       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_oferta            INT UNSIGNED NOT NULL,
  id_candidato         INT UNSIGNED NOT NULL,
  estado               ENUM('enviada','en_revision','preseleccionado','rechazado','aceptado')
                         NOT NULL DEFAULT 'enviada',
  mensaje              TEXT         NULL,
  fecha_postulacion    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_postulacion),
  UNIQUE KEY uq_postulacion (id_oferta, id_candidato),
  KEY idx_post_candidato (id_candidato),
  KEY idx_post_estado (estado),
  CONSTRAINT fk_post_oferta FOREIGN KEY (id_oferta)
    REFERENCES ofertas (id_oferta) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_post_candidato FOREIGN KEY (id_candidato)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notificaciones (in-app) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario       INT UNSIGNED NOT NULL,
  tipo             VARCHAR(40)  NOT NULL DEFAULT 'general',
  titulo           VARCHAR(150) NOT NULL,
  mensaje          VARCHAR(255) NOT NULL,
  leida            TINYINT(1)   NOT NULL DEFAULT 0,
  enlace           VARCHAR(255) NULL,
  fecha_creacion   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion),
  KEY idx_notif_usuario (id_usuario, leida),
  CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
