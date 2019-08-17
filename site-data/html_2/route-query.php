<?php
require '../vendor/autoload.php';

use App\SQLiteFlightConnection;

$sqCon = new SQLiteFlightConnection();
$pdo = $sqCon->connect();
if ($pdo == null)
	echo 'Whoops, could not connect to the SQLite database!';

// query with url?flight=flightcode
$flightId = $_GET["flight"];
if ( strlen($flightId) <= 8 )
	$json = $sqCon->getFlightJson($flightId);

echo '{' . $json . '}';

?>
