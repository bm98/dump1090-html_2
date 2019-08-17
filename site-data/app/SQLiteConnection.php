<?php
namespace App;
 
/**
 * SQLite connnection for Aircraft data
 */
class SQLiteAircraftConnection {
    /**
     * PDO instance
     * @var type 
     */
    private $pdo;
    
    /**
     * return in instance of the PDO object that connects to the SQLite database
     * @return \PDO
     */
    public function connect() {
        if ($this->pdo == null) {
            $this->pdo = new \PDO("sqlite:" . Config::PATH_TO_SQ_AIRCRAFT_FILE);
        }
        return $this->pdo;
    }

    public function PDO() {
        return $this->pdo;
    }

 /**
     * Get items from the database
     * @param string $icaoId
     * @return string
     */
    public function getIcaoJson($icaoId) {
 /*
 TABLE "fa_modes" (
    "icao" TEXT NOT NULL,
    "registration" TEXT,
    "airctype" TEXT,
    "manufacturer" TEXT,
    "aircname" TEXT,
    "operator_" TEXT
 */
        $stmt = $this->pdo->prepare('SELECT * 
                                    FROM fa_modes
                                   WHERE icao = :icao_para;');
        $stmt->bindParam(':icao_para', $icaoId);
        $stmt->execute();

        $json = ''; // default answer
        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
          // create a json item  "key":{"x":"item","y":"item"}
          $json = '"' . $row['icao'] . '":'
            . '{"r":"' . $row['registration'] . '","t":"' . $row['airctype'] . '"'
            . ',"tn":"' . $row['aircname'] . '","tm":"' . $row['manufacturer'] . '"'
            . '}';
        }
        return $json;
    }
}


/**
 * SQLite connnection for flight route information
 */
class SQLiteFlightConnection {
    /**
     * PDO instance
     * @var type 
     */
    private $pdo;
    
    /**
     * return in instance of the PDO object that connects to the SQLite database
     * @return \PDO
     */
    public function connect() {
        if ($this->pdo == null) {
            $this->pdo = new \PDO("sqlite:" . Config::PATH_TO_SQ_FLIGHTS_FILE);
        }
        return $this->pdo;
    }

    public function PDO() {
        return $this->pdo;
    }

 /**
     * Get the items from the database
     * @param int $flightId
     * @return string
     */
    public function getFlightJson($flightId) {
/*
 VIEW "v_named_route" AS SELECT
	 flight_code AS flight,
	 fapt.apt_icao_code AS from_apt_ic,
	 fapt.apt_iata_code AS from_apt_ia,
	 fapt.apt_name AS from_apt_name,
	 tapt.apt_icao_code AS to_apt_ic,
	 tapt.apt_iata_code AS to_apt_ia,
	 tapt.apt_name AS to_apt_name
*/
        $stmt = $this->pdo->prepare('SELECT * 
                                    FROM v_named_route
                                   WHERE flight = :flight_para;');
        $stmt->bindParam(':flight_para', $flightId);
        $stmt->execute();

        $json = 'NO FETCH'; // default answer

        if ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
          // create a json item  "key":{"x":"item","y":"item"}
          $json = '"' . $row['flight'] . '":'
            . '{"fic":"' . $row['from_apt_ic'] . '","fia":"' . $row['from_apt_ia'] .'","fn":"' . $row['from_apt_name'] . '"'
            . ',"tic":"' . $row['to_apt_ic'] . '","tia":"' . $row['to_apt_ia'] .'","tn":"' . $row['to_apt_name']  . '"'
            . '}';
        }
        return $json;
    }

}

?>
