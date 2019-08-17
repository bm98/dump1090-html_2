<?php
require '../vendor/autoload.php';

use App\SQLiteAircraftConnection;

$sqCon = new SQLiteAircraftConnection();
$pdo = $sqCon->connect();
if ($pdo == null)
	echo 'Whoops, could not connect to the SQLite database!';

// query with url?icao=icaocode
$icaoId = $_GET["icao"];
if ( strlen($icaoId) == 6 )
	$json = $sqCon->getIcaoJson($icaoId);

echo '{' . $json . '}';

?>
