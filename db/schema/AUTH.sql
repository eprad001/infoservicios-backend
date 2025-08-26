-- Opcional: endurecer esquema para autenticación
-- Ejecutar una sola vez en la base de datos infoservicios

-- Asegurar que el correo sea único
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'personas' AND c.conname = 'personas_correo_key'
  ) THEN
    ALTER TABLE personas ADD CONSTRAINT personas_correo_key UNIQUE (correo);
  END IF;
END $$;

-- Índice para búsquedas rápidas por correo
CREATE INDEX IF NOT EXISTS idx_personas_correo ON personas (correo);

-- Asegurar columna activo por defecto TRUE (no rompe valores existentes)
ALTER TABLE personas ALTER COLUMN activo SET DEFAULT TRUE;
