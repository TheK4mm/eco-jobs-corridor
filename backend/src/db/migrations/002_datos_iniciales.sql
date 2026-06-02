-- ════════════════════════════════════════════════════════════════════
-- Migración 002 — Catálogos base (roles, categorías, habilidades)
-- Idempotente: usa ON DUPLICATE KEY UPDATE.
-- ════════════════════════════════════════════════════════════════════

INSERT INTO roles (nombre, descripcion) VALUES
  ('admin',     'Administrador de la plataforma'),
  ('empleador', 'Publica ofertas y gestiona postulaciones'),
  ('candidato', 'Busca empleo y se postula a ofertas')
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion);

INSERT INTO categorias (nombre) VALUES
  ('Agricultura y Medio Ambiente'),
  ('Turismo y Hotelería'),
  ('Construcción'),
  ('Comercio y Ventas'),
  ('Tecnología'),
  ('Educación'),
  ('Salud'),
  ('Servicios Generales'),
  ('Administración'),
  ('Transporte y Logística')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO habilidades (nombre) VALUES
  ('Atención al cliente'),
  ('Trabajo en equipo'),
  ('Manejo de Excel'),
  ('Agricultura sostenible'),
  ('Guía turístico'),
  ('Ventas'),
  ('Conducción'),
  ('Cocina'),
  ('Carpintería'),
  ('Programación')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);
