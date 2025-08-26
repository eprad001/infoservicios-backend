CREATE DATABASE infoservicios;

\c infoservicios;

-- Tabla de categorías
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- Tabla de roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- Tabla de personas
CREATE TABLE personas (
    id SERIAL PRIMARY KEY,
    correo VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    ap_paterno VARCHAR(255) NOT NULL,
    ap_materno VARCHAR(255) NOT NULL,
    rut VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL,
    rol_id INTEGER NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- Tabla de servicios
CREATE TABLE servicios (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    detalle TEXT NOT NULL,
    precio INTEGER NOT NULL,
    foto TEXT,
    activo BOOLEAN NOT NULL,
    trabajador_id INTEGER NOT NULL,
    categoria_id INTEGER NOT NULL,
    valoracion INTEGER,
    FOREIGN KEY (trabajador_id) REFERENCES personas(id),
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

-- Tabla de contratos
CREATE TABLE contratos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    trabajador_id INTEGER NOT NULL,
    servicio_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    total INTEGER NOT NULL,
    contratado BOOLEAN NOT NULL,
    finalizado BOOLEAN,
    valoracion INTEGER,
    FOREIGN KEY (cliente_id) REFERENCES personas(id),
    FOREIGN KEY (trabajador_id) REFERENCES personas(id),
    FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);
