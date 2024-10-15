USE RestauranteUnaula;

-- Tabla Usuarios
CREATE TABLE Usuarios (
    Documento VARCHAR(20) PRIMARY KEY, 
    Nombre VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) UNIQUE NOT NULL,
    Telefono VARCHAR(15),
    Rol VARCHAR(20) NOT NULL CHECK (Rol IN ('CLIENTE', 'ADMINISTRADOR'))
);

-- Tabla Mesas
CREATE TABLE Mesas (
    IdMesa INT PRIMARY KEY IDENTITY(1,1), 
    NumeroMesa INT NOT NULL UNIQUE, 
    Capacidad INT NOT NULL,
    Estado VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (Estado IN ('DISPONIBLE', 'OCUPADA', 'FUERA DE SERVICIO'))
);

-- Tabla Reservas
CREATE TABLE Reservas (
    IdReserva INT PRIMARY KEY IDENTITY(1,1),
    Documento VARCHAR(20) NOT NULL, 
	IdMesa INT NOT NULL,
    FechaReserva DATE NOT NULL,
    HoraReserva TIME NOT NULL,
    Estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (Estado IN ('PENDIENTE', 'CONFIRMADA', 'CANCELADA')),
    FechaCreacion DATETIME DEFAULT GETDATE(),
    FechaUltimaModificacion DATETIME DEFAULT GETDATE(),
    FechaCancelacion DATETIME NULL,
    MotivoCancelacion VARCHAR(255),
    FOREIGN KEY (Documento) REFERENCES Usuarios(Documento),
	FOREIGN KEY (IdMesa) REFERENCES Mesas(IdMesa)
);

-- Tabla Horarios
CREATE TABLE Horarios (
    IdHorario INT PRIMARY KEY IDENTITY(1,1),
    DiaSemana VARCHAR(20) NOT NULL CHECK (DiaSemana IN ('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO')),
    HoraApertura TIME NOT NULL,
    HoraCierre TIME NOT NULL,
    Estado VARCHAR(10) NOT NULL CHECK (Estado IN ('ABIERTO', 'CERRADO'))
);

-- Tabla Notificacion
CREATE TABLE Notificacion (
    IdNotificacion INT PRIMARY KEY IDENTITY(1,1),
    IdReserva INT NOT NULL,
    TipoNotificacion VARCHAR(20) NOT NULL CHECK (TipoNotificacion IN ('MODIFICACION', 'CANCELACION')),
    FechaNotificacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IdReserva) REFERENCES Reservas(IdReserva)
);

GO

-- Trigger para actualizar automáticamente FechaUltimaModificacion
CREATE TRIGGER TRFechaUltimaModificacion
ON Reservas
AFTER UPDATE
AS
BEGIN
    UPDATE Reservas
    SET FechaUltimaModificacion = GETDATE()
    FROM Reservas r
    INNER JOIN inserted i ON r.IdReserva = i.IdReserva;
END;

GO

-- Trigger para actualizar automáticamente la FechaCancelación
CREATE TRIGGER TRFechaCancelacion
ON Reservas
AFTER UPDATE
AS
BEGIN
    UPDATE r
    SET r.FechaCancelacion = CASE
        WHEN r.Estado <> 'CANCELADA' AND i.Estado = 'CANCELADA' THEN GETDATE()
        ELSE r.FechaCancelacion
    END
    FROM Reservas r
    INNER JOIN inserted i ON r.IdReserva = i.IdReserva;
END;

GO

-- Trigger para validar reservas en horarios permitidos, y evitar reservas dobles en mismo horario y misma mesa
CREATE TRIGGER TRValidarReservas
ON Reservas
INSTEAD OF INSERT
AS
BEGIN
    DECLARE @DiaSemana VARCHAR(20);
    DECLARE @HoraApertura TIME;
    DECLARE @HoraCierre TIME;
    DECLARE @HoraReserva TIME;
    DECLARE @FechaReserva DATE;
    DECLARE @IdMesa INT;

    -- Obtener la fecha, hora de reserva y mesa de la fila insertada
    SELECT @FechaReserva = FechaReserva, @HoraReserva = HoraReserva, @IdMesa = IdMesa 
    FROM inserted;

    -- Obtener el día de la semana para la fecha de reserva
    SELECT @DiaSemana = DATENAME(WEEKDAY, @FechaReserva);

    -- Consultar la tabla Horarios para obtener las horas de apertura y cierre
    SELECT @HoraApertura = HoraApertura, @HoraCierre = HoraCierre
    FROM Horarios
    WHERE DiaSemana = @DiaSemana;

    -- Validar que la HoraReserva esté dentro del rango de apertura y cierre
    IF @HoraReserva NOT BETWEEN @HoraApertura AND @HoraCierre
    BEGIN
        RAISERROR('La hora de la reserva está fuera del horario de apertura y cierre del restaurante.', 16, 1);
        RETURN; -- Abortamos la operación
    END;

    -- Comprobar si ya existe una reserva para la misma mesa, fecha y hora
    IF EXISTS (
        SELECT 1 
        FROM Reservas r
        INNER JOIN inserted i ON r.IdMesa = i.IdMesa 
        AND r.FechaReserva = i.FechaReserva 
        AND r.HoraReserva = i.HoraReserva
        WHERE r.Estado IN ('PENDIENTE', 'CONFIRMADA') -- Solo reservas activas
    )
    BEGIN
        RAISERROR('Ya existe una reserva para esta mesa en la misma fecha y hora.', 16, 1);
        RETURN; -- Abortamos la operación
    END;

    -- Si no hay conflictos, realizamos la inserción
    INSERT INTO Reservas (Documento, FechaReserva, HoraReserva, IdMesa, Estado)
    SELECT Documento, FechaReserva, HoraReserva, IdMesa, Estado
    FROM inserted;
END;
