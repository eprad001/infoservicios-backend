INSERT INTO roles (nombre) VALUES
('Administrador'),
('Cliente'),
('Trabajador');

INSERT INTO categorias (nombre) VALUES
('Electricidad'),
('Plomería'),
('Jardinería'),
('Limpieza'),
('Reparaciones');

INSERT INTO personas (correo, password, nombre, ap_paterno, ap_materno, rut, telefono, activo, rol_id) VALUES
('cliente1@mail.com', 'hashed_pw1', 'Ana', 'Gómez', 'Rivas', '12.345.678-9', '+56911111111', TRUE, 2),
('cliente2@mail.com', 'hashed_pw2', 'Luis', 'Martínez', 'Pérez', '15.678.901-2', '+56922222222', TRUE, 2),
('trabajador1@mail.com', 'hashed_pw3', 'Carlos', 'Soto', 'Fernández', '18.901.234-5', '+56933333333', TRUE, 3),
('trabajador2@mail.com', 'hashed_pw4', 'Marcela', 'Vega', 'Torres', '20.123.456-7', '+56944444444', TRUE, 3);

INSERT INTO servicios (titulo, descripcion, detalle, precio, foto, activo, trabajador_id, categoria_id, valoracion) VALUES
('Instalación de enchufes', 'Servicio de instalación segura de enchufes eléctricos.', 'Incluye revisión de red y materiales básicos.', 25000, NULL, TRUE, 3, 1, 5),
('Reparación de cañerías', 'Solución rápida a filtraciones y roturas.', 'Uso de repuestos certificados y garantía de 30 días.', 30000, NULL, TRUE, 4, 2, 4),
('Corte de césped', 'Mantenimiento de jardines residenciales.', 'Incluye bordeado y retiro de residuos.', 15000, NULL, TRUE, 4, 3, 5),
('Limpieza profunda de hogar', 'Limpieza completa de interiores.', 'Incluye cocina, baños, ventanas y pisos.', 40000, NULL, TRUE, 3, 4, 5);

INSERT INTO contratos (cliente_id, trabajador_id, servicio_id, cantidad, total, contratado, finalizado, valoracion) VALUES
(1, 3, 1, 2, 50000, TRUE, TRUE, 5),
(2, 4, 2, 1, 30000, TRUE, FALSE, NULL),
(1, 4, 3, 1, 15000, TRUE, TRUE, 4),
(2, 3, 4, 1, 40000, TRUE, TRUE, 5);