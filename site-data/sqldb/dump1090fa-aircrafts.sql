CREATE TABLE "fa_modes" (
    "icao" TEXT NOT NULL,
    "registration" TEXT,
    "airctype" TEXT,
    "manufacturer" TEXT,
    "aircname" TEXT,
    "operator_" TEXT
);

CREATE UNIQUE INDEX "i_fa_icao" on fa_modes (icao ASC);
