CREATE TABLE "airports" (
    "apt_icao_code" TEXT NOT NULL,
    "apt_iata_code" TEXT,
    "iso_country" TEXT,
    "iso_region" TEXT,
    "lat" TEXT,
    "lon" TEXT,
    "elevation" TEXT,
    "apt_type" TEXT,
    "apt_name" TEXT
);

CREATE TABLE "routes" (
    "flight_code" TEXT NOT NULL,
    "from_apt_icao" TEXT,
    "to_apt_icao" TEXT
);
CREATE UNIQUE INDEX "i_routes_flight" on routes (flight_code ASC);
CREATE UNIQUE INDEX "i_airports_icao" on airports (apt_icao_code ASC);

CREATE VIEW "v_route_icao" AS SELECT
 flight_code AS flight,
 from_apt_icao AS from_apt,
 to_apt_icao AS to_apt
FROM
 routes;

 CREATE VIEW "v_route_iata" AS SELECT
 flight_code AS flight,
 fapt.apt_iata_code AS from_apt,
 tapt.apt_iata_code AS to_apt
FROM
 routes
INNER JOIN airports fapt ON fapt.apt_icao_code = routes.from_apt_icao
INNER JOIN airports tapt ON tapt.apt_icao_code = routes.to_apt_icao;

 CREATE VIEW "v_named_route" AS SELECT
 flight_code AS flight,
 
 fapt.apt_icao_code AS from_apt_ic,
 fapt.apt_iata_code AS from_apt_ia,
 fapt.apt_name AS from_apt_name,
 
 tapt.apt_icao_code AS to_apt_ic,
 tapt.apt_iata_code AS to_apt_ia,
 tapt.apt_name AS to_apt_name
FROM
 routes
INNER JOIN airports fapt ON fapt.apt_icao_code = routes.from_apt_icao
INNER JOIN airports tapt ON tapt.apt_icao_code = routes.to_apt_icao;
