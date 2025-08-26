-- contratos con items + totales
CREATE TABLE IF NOT EXISTS contrato_items (
  id              SERIAL PRIMARY KEY,
  contrato_id     INT NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  servicio_id     INT NOT NULL REFERENCES servicios(id),
  cantidad        INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(12,2) NOT NULL,
  valoracion      INT NOT NULL DEFAULT 0
);
ALTER TABLE contratos
  ADD COLUMN IF NOT EXISTS total NUMERIC(14,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creado_en TIMESTAMP DEFAULT now();
